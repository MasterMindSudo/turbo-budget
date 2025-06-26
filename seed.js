const admin = require('firebase-admin');

// Replace with your service account key file
const serviceAccount = require('/home/user/turbo-budget/turbo-budget-21f5a-firebase-adminsdk-fbsvc-7bfef5b4df.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  // Create a demo user (you might want to create this user through Firebase Authentication first)
  const demoUserId = 'demoUserId'; // Replace with an actual user ID from Firebase Authentication
  const demoUserRef = db.collection('users').doc(demoUserId);
  await demoUserRef.set({
    displayName: 'Demo User',
    email: 'demo@example.com',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create a sample group
  const newGroupRef = db.collection('groups').doc();
  const groupId = newGroupRef.id;
  await newGroupRef.set({
    name: 'Sample Family Budget',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Add the demo user as an accepted member
  const memberRef = db.collection(`groups/${groupId}/members`).doc(demoUserId);
  await memberRef.set({
    userId: demoUserId,
    displayName: 'Demo User',
    invitedBy: null, // Assuming the user created the group or joined directly
    status: 'accepted',
    joinedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create a sample expense
  await db.collection(`groups/${groupId}/expenses`).add({
    title: 'Groceries',
    amount: 150.75,
    currency: 'USD',
    paidBy: demoUserId,
    date: admin.firestore.Timestamp.now(),
    participants: [{
      memberId: demoUserId,
      share: 150.75
    }]
  });

  // Create a sample recurring template
  await db.collection(`groups/${groupId}/recurring`).add({
    template: {
      title: 'Rent',
      amount: 1200,
      currency: 'USD',
      paidBy: demoUserId,
      participants: [{
        memberId: demoUserId,
        share: 1200
      }]
    },
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 1,
    nextRun: admin.firestore.Timestamp.fromMillis(Date.now() + (30 * 24 * 60 * 60 * 1000)) // Next month
  });

  console.log('Database seeded successfully!');
}

seedDatabase().catch(console.error);