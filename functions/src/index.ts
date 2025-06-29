import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Cloud Function to create a user document in Firestore when a new user signs up
export const createUserDocument = functions.auth.user().onCreate((user) => {
  const { uid, email, displayName, photoURL } = user;
  const userRef = admin.firestore().collection("users").doc(uid);

  return userRef.set({
    uid,
    email,
    displayName: displayName || "New User",
    photoURL: photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});