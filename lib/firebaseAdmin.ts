//lib/firebaseAdmin.ts입니다

import * as admin from "firebase-admin";

// Firebase Admin 초기화 (중복 초기화 방지)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("✅ Firebase Admin 초기화 완료");
  } catch (error) {
    console.error("❌ Firebase Admin 초기화 실패:", error);
  }
}

// Firestore 인스턴스 가져오기
export const dbAdmin = admin.apps.length > 0 ? admin.firestore() : null;

// 안전하게 Firestore 가져오기
export function getFirestoreSafe() {
  if (!dbAdmin) {
    throw new Error("Firebase Admin이 초기화되지 않았습니다.");
  }
  return dbAdmin;
}