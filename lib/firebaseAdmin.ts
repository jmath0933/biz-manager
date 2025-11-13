import admin from "firebase-admin";

function getServiceAccountFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      // fallthrough to using individual env vars
    }
  }
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;
  if (privateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      project_id: process.env.FIREBASE_PROJECT_ID,
    };
  }
  return undefined;
}

const serviceAccount = getServiceAccountFromEnv();

if (serviceAccount) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
} else {
  // 빌드/런타임에서 env가 없을 경우 무조건 예외로 멈추지 않도록 로그만 남깁니다.
  // 필요하면 여기에 fallback 동작을 정의하세요.
  // console.warn("Firebase admin not initialized: missing service account env variables.");
}

export const db = admin.firestore();
export default admin;