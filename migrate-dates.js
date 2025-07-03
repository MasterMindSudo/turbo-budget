const admin = require('firebase-admin');
const { parseDate } = require('./dist/lib/budget'); // Assuming your compiled JS is in 'dist'

// --- Configuration ---
const serviceAccount = require('./turbo-budget-21f5a-firebase-adminsdk-fbsvc-2d2aa428e7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateExpenseDates() {
  console.log('Starting expense date migration...');
  const groupsSnapshot = await db.collection('groups').get();
  
  if (groupsSnapshot.empty) {
    console.log('No groups found. Exiting.');
    return;
  }

  console.log(`Found ${groupsSnapshot.size} group(s).`);

  for (const groupDoc of groupsSnapshot.docs) {
    const groupId = groupDoc.id;
    console.log(`\n--- Processing Group: ${groupId} ---`);
    const expensesRef = db.collection(`groups/${groupId}/expenses`);
    const expensesSnapshot = await expensesRef.get();

    if (expensesSnapshot.empty) {
      console.log('No expenses to migrate in this group.');
      continue;
    }

    const batch = db.batch();
    let migrationCount = 0;

    expensesSnapshot.forEach(expenseDoc => {
      const expenseData = expenseDoc.data();
      const originalDate = expenseData.date;

      // Check if the date is NOT a Firestore Timestamp
      if (originalDate && !(originalDate instanceof admin.firestore.Timestamp)) {
        const parsedDate = parseDate(originalDate); // Use our robust parser

        if (parsedDate) {
          console.log(`  Migrating doc '${expenseDoc.id}': '${originalDate}' -> ${parsedDate.toISOString()}`);
          const expenseRef = expensesRef.doc(expenseDoc.id);
          batch.update(expenseRef, { date: admin.firestore.Timestamp.fromDate(parsedDate) });
          migrationCount++;
        } else {
          console.warn(`  Could not parse date for doc '${expenseDoc.id}'. Value:`, originalDate);
        }
      }
    });

    if (migrationCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${migrationCount} expense(s) for group ${groupId}.`);
    } else {
      console.log('All expense dates in this group are already Timestamps.');
    }
  }

  console.log('\nMigration complete.');
}

migrateExpenseDates().catch(console.error);
