// firebase.ts (프로젝트 루트)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 반드시 NEXT_PUBLIC_* 환경변수만 사용 (클라이언트 실행 가능)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 이미 초기화된 앱이 있으면 재사용
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore / Storage 인스턴스
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
