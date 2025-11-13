import admin from "firebase-admin";

type ServiceAccountLike = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  [k: string]: any;
};

let initialized = false;

/**
 * 환경변수에서 서비스 계정 정보를 추출합니다.
 * 우선 FIREBASE_SERVICE_ACCOUNT (JSON 전체)를 사용하고,
 * 없으면 개별 ENV (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID)를 사용합니다.
 * private_key 내에 "\\n" 이스케이프가 있으면 실제 개행으로 복원합니다.
 */
function getServiceAccountFromEnv(): ServiceAccountLike | undefined {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.private_key === "string") {
          parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
        }
        return parsed;
      }
    } catch (e) {
      // JSON 파싱 실패 시 다음 방법으로 폴백
      console.warn("FIREBASE_SERVICE_ACCOUNT parsing failed:", (e as Error).message);
    }
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    return {
      private_key: privateKey,
      client_email: clientEmail,
      project_id: projectId,
    };
  }

  return undefined;
}

/**
 * 필요 시 firebase-admin을 초기화합니다.
 * 초기화 불가능하면 false를 반환(호출자에서 처리).
 */
export function ensureFirebaseInitialized(): boolean {
  if (initialized) return true;

  const serviceAccount = getServiceAccountFromEnv();
  if (!serviceAccount) {
    // 빌드(또는 런타임) 시점에 env가 없으면 예외를 던지지 않고 false 반환
    return false;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  initialized = true;
  return true;
}

/**
 * 초기화되어 있으면 Firestore 인스턴스를 반환, 아니면 null 반환.
 * API 핸들러 내부에서 호출하세요.
 */
export function getFirestoreSafe(): FirebaseFirestore.Firestore | null {
  if (!ensureFirebaseInitialized()) return null;
  return admin.firestore();
}

/**
 * 초기화되어 있으면 admin을 반환, 아니면 null.
 */
export function getAdminSafe(): typeof admin | null {
  if (!ensureFirebaseInitialized()) return null;
  return admin;
}

// 하위 코드의 호환성을 위해 admin을 default로 내보내긴 하지만
// 모듈 로드 시점에 firestore()를 호출하지 않도록 주의하세요.
export default admin;