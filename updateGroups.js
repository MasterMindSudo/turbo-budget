const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your-service-account-file.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateExistingGroups() {
  const groupsRef = db.collection('groups');
  const snapshot = await groupsRef.get();

  if (snapshot.empty) {
    console.log('No existing groups found.');
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    const groupRef = groupsRef.doc(doc.id);
    const membersRef = groupRef.collection('members');
    membersRef.get().then(memberSnapshot => {
      const memberUserIds = memberSnapshot.docs.map(memberDoc => memberDoc.data().userId);
      batch.update(groupRef, { memberUserIds });
    });
  });

  await batch.commit();
  console.log('Existing groups updated successfully!');
}

updateExistingGroups().catch(console.error);
