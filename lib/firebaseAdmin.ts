import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

export function getFirestoreSafe() {
  try {
    if (!app) {
      if (admin.apps.length === 0) {
        app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
        console.log("🔥 Firebase Admin initialized");
      } else {
        app = admin.app();
      }
    }

    return admin.firestore();
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
    return null;
  }
}

export function getAdminSafe() {
  if (!app && admin.apps.length > 0) {
    app = admin.app();
  }
  return app ? admin : null;
}
