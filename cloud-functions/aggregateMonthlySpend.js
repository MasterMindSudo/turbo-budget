
// /Users/kevinlam/Projects/turbo-budget/cloud-functions/aggregateMonthlySpend.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()

/**
 * Cloud Function to aggregate monthly spending totals when an expense is
 * created, updated, or deleted.
 *
 * This function is triggered by any write to /groups/{groupId}/expenses/{expenseId}.
 */
exports.aggregateMonthlySpend = functions.firestore
  .document('/groups/{groupId}/expenses/{expenseId}')
  .onWrite(async (change, context) => {
    const { groupId } = context.params
    const expenseBefore = change.before.data()
    const expenseAfter = change.after.data()

    // Determine the change in amount
    const amountBefore = expenseBefore ? expenseBefore.amount : 0
    const amountAfter = expenseAfter ? expenseAfter.amount : 0
    const amountDifference = amountAfter - amountBefore

    // Determine the change in category amount
    const categoryBefore = expenseBefore ? expenseBefore.category : null
    const categoryAfter = expenseAfter ? expenseAfter.category : null

    // If the amount and category are unchanged (e.g., just a description edit), do nothing.
    if (amountDifference === 0 && categoryBefore === categoryAfter) {
      console.log('No change in amount or category; skipping aggregation.')
      return null
    }

    // Get the month ID (e.g., "202506") from the expense date.
    // Use the date from *after* the change if it exists, otherwise from *before*.
    const expenseDate = expenseAfter ? expenseAfter.date.toDate() : expenseBefore.date.toDate()
    const year = expenseDate.getFullYear()
    const month = (expenseDate.getMonth() + 1).toString().padStart(2, '0')
    const monthId = `${year}${month}`

    const monthlySpendRef = db.collection('groups').doc(groupId)
                             .collection('monthlySpend').doc(monthId)

    return db.runTransaction(async (transaction) => {
      const monthlySpendDoc = await transaction.get(monthlySpendRef)

      const categoryUpdates = {}

      // Case 1: Expense was CREATED or amount INCREASED
      if (amountDifference > 0) {
        if (categoryAfter) {
          categoryUpdates[`categories.${categoryAfter}`] = admin.firestore.FieldValue.increment(amountDifference)
        }
      }
      // Case 2: Expense was DELETED or amount DECREASED
      else if (amountDifference < 0) {
        if (categoryBefore) {
          categoryUpdates[`categories.${categoryBefore}`] = admin.firestore.FieldValue.increment(amountDifference) // amountDifference is negative
        }
      }
      // Case 3: Expense was UPDATED (category changed)
      else if (categoryBefore !== categoryAfter) {
        if (categoryBefore) {
          categoryUpdates[`categories.${categoryBefore}`] = admin.firestore.FieldValue.increment(-amountAfter)
        }
        if (categoryAfter) {
          categoryUpdates[`categories.${categoryAfter}`] = admin.firestore.FieldValue.increment(amountAfter)
        }
      }

      if (!monthlySpendDoc.exists) {
        // The document doesn't exist, so create it.
        transaction.set(monthlySpendRef, {
          total: amountDifference,
          ...categoryUpdates,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        // The document exists, so update it.
        transaction.update(monthlySpendRef, {
          total: admin.firestore.FieldValue.increment(amountDifference),
          ...categoryUpdates,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    })
  })
