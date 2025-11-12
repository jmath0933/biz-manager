import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import axios from "axios";
import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp  } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
  projectId: process.env.FIREBASE_PROJECT_ID,
};
// ✅ 앱이 이미 초기화되어 있으면 재사용, 아니면 새로 초기화
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  const base = "e:\\Dropbox\\BUSINESS\\2025년 세금계산서";
  const folder = typeCode === "00" ? "매출" : "매입";
  return path.join(base, folder, filename);
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
    console.log("✅ Buffer 생성 완료");

    const pdfData = await pdf(buffer);
    console.log("✅ pdf-parse 실행 완료");

    const extractedText = pdfData.text;
    console.log("✅ PDF 텍스트 추출 완료, 길이:", extractedText.length);
    console.log("📄 추출된 텍스트 (처음 500자):", extractedText.substring(0, 500));

    if (!extractedText || extractedText.trim().length === 0) {
      console.log("❌ 추출된 텍스트 없음");
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

    console.log("🔑 환경변수 확인:", {
      endpoint: endpoint ? "✅" : "❌",
      deploymentId: deploymentId ? "✅" : "❌",
      apiKey: apiKey ? "✅" : "❌"
    });

    if (!endpoint || !deploymentId || !apiKey) {
      console.error("❌ 환경변수 누락");
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
          content:
            "당신은 한국 전자세금계산서를 분석하는 전문가입니다. 항상 유효한 JSON만 반환합니다."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800,
      
    };

    console.log("🤖 Azure OpenAI 호출 중...");

    const response = await axios.post<OpenAIResponse>(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      timeout: 30000
    });

    const result = response.data.choices[0].message.content;
    console.log("✅ GPT 응답:", result);

    // ====== JSON 파싱 ======
    let parsed;
    try {
      const cleanedResult = result
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanedResult);
    } catch (err) {
      console.error("❌ JSON 파싱 오류:", result);
      return NextResponse.json(
        { error: "GPT 응답이 올바른 JSON 형식이 아닙니다.", raw: result },
        { status: 500 }
      );
    }

    console.log("✅ 최종 파싱 결과:", parsed);

    // ====== 🔹 Firebase + 파일 저장 ======
    const 분류 = classifyInvoice(parsed.supplier, parsed.customer);
    const typeCode = 분류.저장위치 === "매출" ? "00" : "01";
    const filename = generateFilename(parsed, typeCode);
    const savePath = getSavePath(typeCode, filename);

    await addDoc(collection(db, 분류.저장위치 === "매출" ? "sales" : "purchases"), {
      ...parsed,
      기준회사: 분류.기준,
      관계유형: 분류.관계,
      저장위치: 분류.저장위치,
      savedAt: new Date().toISOString()
    });
    console.log("✅ Firebase 저장 완료");

    fs.writeFileSync(savePath, buffer);
    console.log("📁 PDF 저장 완료:", savePath);

    // ====== 응답 ======
    return NextResponse.json({ success: true, data: parsed, savedTo: savePath });
  } catch (error: any) {
    console.error("❌❌❌ 최상위 오류 발생 ❌❌❌");
    console.error("오류 타입:", error.constructor.name);
    console.error("오류 메시지:", error.message);
    console.error("오류 스택:", error.stack);

    if (error.response) {
      console.error("API 응답 오류:", error.response.status);
      console.error(
        "API 응답 데이터:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    return NextResponse.json(
      {
        error: "처리 중 오류 발생",
        message: error.message,
        details: error.response?.data?.error?.message || error.toString()
      },
      { status: 500 }
    );
  }
}
