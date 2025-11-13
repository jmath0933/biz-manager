// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 아래 설정은 본인 Firebase 콘솔에서 복사해서 교체하세요.
const firebaseConfig = {
  apiKey: "AIzaSyDycf5cKdiNN1-T80MylNob_2eC2vdOaKY",
  authDomain: "biz-manager-ten.firebaseapp.com",
  projectId: "biz-manager-ten",
  storageBucket: "biz-manager-ten.firebasestorage.app",
  messagingSenderId: "133233551619",
  appId: "1:133233551619:web:1dc507843b0e81801c2136",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
