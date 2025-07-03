// /Users/kevinlam/Projects/turbo-budget/debug-expenses.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your-service-account-file.json'); // <<< IMPORTANT: YOU MUST REPLACE THIS

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getExpensesForGroup(groupId) {
  console.log(`--- Debugging Expenses for Group ID: ${groupId} ---`);

  if (!groupId) {
    console.error("Error: Group ID is missing. Please provide a valid group ID.");
    return;
  }

  try {
    const expensesRef = db.collection(`groups/${groupId}/expenses`);
    const querySnapshot = await expensesRef.get();

    if (querySnapshot.empty) {
      console.log("No expenses found for this group.");
      return;
    }

    console.log(`Found ${querySnapshot.size} expense(s).`);
    console.log("----------------------------------------");

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const expenseDate = data.date ? (data.date.toDate ? data.date.toDate() : data.date) : 'No Date';
      console.log(`  - Expense ID: ${doc.id}`);
      console.log(`    Title: ${data.title}`);
      console.log(`    Amount: ${data.amount}`);
      console.log(`    Date: ${expenseDate}`);
      console.log(`    Category: ${data.category || 'N/A'}`);
      console.log("----------------------------------------");
    });

  } catch (error) {
    console.error("An error occurred while fetching expenses:", error);
  }
}

// --- How to Use ---
// 1. Replace the placeholder for your service account key file above.
// 2. Get a real Group ID from your Firestore database.
// 3. Replace the placeholder Group ID below with the real one.
// 4. Run from your terminal: `node debug-expenses.js`

const groupIdToDebug = 'DvO1x50MPm6tf2gXYVE8'; // <<< REPLACE WITH A REAL GROUP ID FROM YOUR DATABASE
getExpensesForGroup(groupIdToDebug);
