import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import axios from "axios";
import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, Firestore } from "firebase/firestore";

export const runtime = "nodejs";
export const maxDuration = 60;

interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

// ===========================
// 🔹 Firebase 초기화
// ===========================
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

console.log("🔥 Firebase Config 확인:", firebaseConfig);

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("✅ Firestore 인스턴스 초기화 완료");
} catch (err) {
  console.error("❌ Firestore 초기화 실패:", err);
}

// ===========================
// 🔹 회사명 정규화 및 분류
// ===========================
function normalize(name: string): string {
  if (!name) return "";
  if (name.includes("포항케이이씨")) return "포항케이이씨";
  if (name.includes("케이이씨")) return "케이이씨";
  return name;
}

function classifyInvoice(supplier: string, customer: string) {
  const s = normalize(supplier);
  const c = normalize(customer);

  if ((s === "포항케이이씨" && c === "케이이씨") || (s === "케이이씨" && c === "포항케이이씨")) {
    return { 기준: "포항케이이씨", 저장위치: s === "포항케이이씨" ? "매출" : "매입", 관계: "본사↔지사" };
  }
  if (s === "포항케이이씨" || c === "포항케이이씨") {
    return { 기준: "포항케이이씨", 저장위치: s === "포항케이이씨" ? "매출" : "매입", 관계: "지사↔외부" };
  }
  if (s === "케이이씨" || c === "케이이씨") {
    return { 기준: "케이이씨", 저장위치: s === "케이이씨" ? "매출" : "매입", 관계: "본사↔외부" };
  }
  return { 기준: "기타", 저장위치: "기타", 관계: "기타" };
}

// ===========================
// 🔹 파일명 및 경로 처리
// ===========================
function formatDate(yyDate: string) {
  const [yy, mm, dd] = yyDate.split("-");
  return `20${yy}_${mm}_${dd}`;
}
function sanitize(text: string) {
  return text ? text.replace(/[\\/:*?"<>|]/g, "") : "";
}
function generateFilename(data: any, typeCode: "00" | "01") {
  const date = formatDate(data.date || "00-00-00");
  const supplier = sanitize(data.customer || "UNKNOWN");
  const item = sanitize(data.item || "NOITEM");
  const amount = `(${data.totalAmount || "0"})`;
  return `${date}_${supplier}_${item}_${amount}_${typeCode}.pdf`;
}
function getSavePath(typeCode: "00" | "01", filename: string) {

      // 🧩 환경 감지
  const isVercel = process.env.VERCEL === "1" || process.env.NOW_REGION !== undefined;

    const base = isVercel
    ? "/tmp/BUSINESS/2025년 세금계산서" // ✅ Vercel 서버에서만 사용 가능한 경로
    : "E:\\Dropbox\\BUSINESS\\2025년 세금계산서"; // ✅ 로컬에서는 이 경로 사용

  const folder = typeCode === "00" ? "매출" : "매입";
  
  const saveDir = path.join(base, folder, filename);

  try {
    // 🏗️ 폴더가 없으면 자동 생성
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
      console.log("📁 폴더 생성:", saveDir);
    }
  } catch (err) {
    console.error("❌ 폴더 생성 실패:", err);
  }
  
  const fullPath = path.join(saveDir, filename);
  console.log("💾 저장 경로:", fullPath);

  return fullPath;
}

// ===========================
// 🔹 메인 핸들러
// ===========================
export async function POST(req: NextRequest) {
  console.log("🚀 API 호출 시작");

  try {
    const formData = await req.formData();
    console.log("✅ FormData 파싱 완료");

    const file = formData.get("file") as File;
    if (!file) {
      console.log("❌ 파일 없음");
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    console.log("📄 PDF 파일 수신:", file.name, file.size, "bytes");

    // ====== PDF 텍스트 추출 ======
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "PDF에서 텍스트를 추출하지 못했습니다." },
        { status: 500 }
      );
    }

    // ====== Azure OpenAI 설정 ======
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const apiVersion = "2024-02-15-preview";

    if (!endpoint || !deploymentId || !apiKey) {
      return NextResponse.json(
        { error: "Azure OpenAI 환경 변수가 누락되었습니다." },
        { status: 500 }
      );
    }

    // ====== 프롬프트 작성 ======
    const prompt = `다음은 한국 전자세금계산서의 표 형식 텍스트입니다.

아래 10개 항목을 정확히 추출하여 JSON 형식으로만 반환하세요:

{
  "date": "작성일자 (YY-MM-DD)",
  "supplier": "공급자 상호명",
  "customer": "수요자 상호명",
  "item": "품목명",
  "spec": "규격",
  "unitPrice": "단가",
  "quantity": "수량",
  "supplyValue": "공급가액",
  "tax": "세액",
  "totalAmount": "합계금액"
}

세금계산서 텍스트:
${extractedText.slice(0, 5000)}

JSON만 반환:`;

    const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
    const payload = {
      messages: [
        {
          role: "system",
          content: "당신은 한국 전자세금계산서를 분석하는 전문가입니다. 항상 유효한 JSON만 반환합니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 800,
    };

    const response = await axios.post<OpenAIResponse>(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      timeout: 30000,
    });

    const result = response.data.choices[0].message.content;

    // ====== JSON 파싱 ======
    let parsed;
    try {
      const cleanedResult = result
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanedResult);
    } catch (err) {
      return NextResponse.json(
        { error: "GPT 응답이 올바른 JSON 형식이 아닙니다.", raw: result },
        { status: 500 }
      );
    }

    const 분류 = classifyInvoice(parsed.supplier, parsed.customer);
    const typeCode = 분류.저장위치 === "매출" ? "00" : "01";
    const filename = generateFilename(parsed, typeCode);
    const savePath = getSavePath(typeCode, filename);

    if (db) {
      await addDoc(collection(db, 분류.저장위치 === "매출" ? "sales" : "purchases"), {
        ...parsed,
        기준회사: 분류.기준,
        관계유형: 분류.관계,
        저장위치: 분류.저장위치,
        savedAt: new Date().toISOString(),
      });
      console.log("✅ Firebase 저장 완료");
    } else {
      console.error("❌ Firestore DB 객체 없음 - Firebase 미연결");
    }

    fs.writeFileSync(savePath, buffer);
    console.log("📁 PDF 저장 완료:", savePath);

    return NextResponse.json({ success: true, data: parsed, savedTo: savePath });
  } catch (error: any) {
    console.error("❌❌❌ 최상위 오류 발생 ❌❌❌", error);
    return NextResponse.json(
      {
        error: "처리 중 오류 발생",
        message: error.message,
        details: error.response?.data?.error?.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
