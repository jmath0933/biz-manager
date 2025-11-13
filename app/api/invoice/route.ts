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

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.error("❌ Firestore 초기화 실패:", err);
}

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

function toDateCode(dateStr: string): number {
  const [yy, mm, dd] = dateStr.split("-");
  return parseInt(`${yy}${mm}${dd}`);
}

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
  const isVercel = process.env.VERCEL === "1" || process.env.NOW_REGION !== undefined;
  const base = isVercel
    ? "/tmp/BUSINESS/2025년 세금계산서"
    : "E:\\Dropbox\\BUSINESS\\2025년 세금계산서";

  const folder = typeCode === "00" ? "매출" : "매입";
  const fullPath = path.join(base, folder, filename);

  try {
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.error("❌ 폴더 생성 실패:", err);
  }

  return fullPath;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const shouldSave = formData.get("save") === "true";

    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "PDF에서 텍스트를 추출하지 못했습니다." }, { status: 500 });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const apiVersion = "2024-02-15-preview";

    if (!endpoint || !deploymentId || !apiKey) {
      return NextResponse.json({ error: "Azure OpenAI 환경 변수가 누락되었습니다." }, { status: 500 });
    }

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

**중요 지침:**
- 반드시 위의 영문 키 이름을 사용하세요
- JSON 객체만 반환하고 설명은 절대 포함하지 마세요
- 찾을 수 없는 항목은 빈 문자열 ""로 설정
- 숫자는 쉼표 포함하여 문자열로 반환 (예: "100,000")
- 마이너스 금액은 "-" 기호를 포함한 문자열로 정확히 표현 (예: "-1,000,000")
- 공급자와 수요자는 단어 간 간격이 클 경우 앞쪽 회사명까지만 추출하고, 성명은 제외
- 품목에 크기 표현이 포함된 경우, 크기까지만 규격으로 분리하고 나머지는 품목으로 유지
- "ea" 앞에 있는 자연수는 수량으로 추출 (예: "188ea" → "188")
- 작성일자는 YYYY-MM-DD 형식으로 추출한 후, 앞의 연도 2자리를 제거하여 YY-MM-DD 형식으로 변환하세요 (예: "2025-09-26" → "25-09-26")
- 표 제목, 설명, 레이블은 포함하지 말고 셀 안의 실제 값만 추출하세요

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

    let parsed;
    try {
      const cleanedResult = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleanedResult);
    } catch (err) {
      return NextResponse.json({ error: "GPT 응답이 올바른 JSON 형식이 아닙니다.", raw: result }, { status: 500 });
    }

    const 분류 = classifyInvoice(parsed.supplier, parsed.customer);
    const typeCode = 분류.저장위치 === "매출" ? "00" : "01";
    const filename = generateFilename(parsed, typeCode);
    const savePath = getSavePath(typeCode, filename);
    const numericDate = toDateCode(parsed.date);

    if (shouldSave)
            // 🔢 날짜를 YYMMDD 숫자로 변환
   

    // 🔹 Firestore 저장
    if (db) {
      await addDoc(collection(db, 분류.저장위치 === "매출" ? "sales" : "purchases"), {
        ...parsed,
        date: numericDate, // ✅ 숫자 날짜로 저장
        기준회사: 분류.기준,
        관계유형: 분류.관계,
        저장위치: 분류.저장위치,
        savedAt: new Date().toISOString(),
      });
      console.log("✅ Firestore 저장 완료");
    } else {
      console.error("❌ Firestore DB 객체 없음 - Firebase 미연결");
    }

    // 🔹 PDF 파일 저장
    fs.writeFileSync(savePath, buffer);
    console.log("📁 PDF 저장 완료:", savePath);
  // ✅ 응답은 try 블록 안에서 반환
  return NextResponse.json({
    success: true,
    data: {
      ...parsed,
      date: numericDate,
    },
    saved: shouldSave,
    savedTo: shouldSave ? savePath : null,
  });
} catch (error: any) {
  console.error("❌ 최상위 오류 발생:", error);
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