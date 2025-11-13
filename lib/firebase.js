import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDycfsKdiNN1-T80MylNob_2eC2vdOaKY",
  authDomain: "biz-manager-ten.firebaseapp.com",
  projectId: "biz-manager-ten",
  storageBucket: "biz-manager-ten.firebasestorage.app",
  messagingSenderId: "133233551619",
  appId: "1:133233551619:web:1dc507843b0e81801c2136",
  measurementId: "G-6WEPDHXVLQ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
