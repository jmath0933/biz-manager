import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    console.log("📄 파일 수신:", file.name);

    // PDF를 ArrayBuffer → Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Step 1: pdf-parse로 기본 텍스트 추출
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);
    let text = pdfData.text?.trim() || "";

    console.log("📜 PDF 텍스트 추출 완료, 길이:", text.length);

    // ✅ Step 2: 텍스트가 너무 짧거나 빈 경우 OCR 수행
    if (text.length < 100) {
      console.log("⚠️ 텍스트가 부족하여 OCR 실행 중...");

      // tesseract.js로 OCR 처리
      const ocrResult = await Tesseract.recognize(buffer, "kor+eng", {
        logger: (m) => console.log("🌀 OCR 진행률:", m.progress),
      });
      text = ocrResult.data.text.trim();
      console.log("✅ OCR 결과 텍스트 길이:", text.length);
    }

    const cleanText = text.replace(/\s+/g, " ").trim();

    // ✅ Step 3: 주요 10개 항목 추출
    const result = {
      fileName: file.name,
      date: extractDate(cleanText),
      supplier: extractSupplier(cleanText),
      receiver: extractReceiver(cleanText),
      businessNumber: extractBusinessNumber(cleanText),
      itemName: extractItemName(cleanText),
      specification: extractSpecification(cleanText),
      qty: extractQty(cleanText),
      unitPrice: extractUnitPrice(cleanText),
      supplyPrice: extractSupplyPrice(cleanText),
      total: extractTotal(cleanText),
    };

    console.log("✅ 최종 추출 결과:", result);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("❌ PDF 추출 오류:", error);
    return NextResponse.json(
      { error: error.message || "PDF 처리 중 오류 발생" },
      { status: 500 }
    );
  }
}

// ============================
// 🔍 항목별 추출 유틸
// ============================

function extractDate(text: string): string {
  const match = text.match(/(\d{4})[.\-\/\s]*(\d{1,2})[.\-\/\s]*(\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : "";
}

function extractSupplier(text: string): string {
  const m = text.match(/공급자.*?상호[:\s]*([가-힣A-Za-z0-9㈜\s]+)/);
  return m ? m[1].trim() : "";
}

function extractReceiver(text: string): string {
  const m = text.match(/공급받는자.*?상호[:\s]*([가-힣A-Za-z0-9㈜\s]+)/);
  return m ? m[1].trim() : "";
}

function extractBusinessNumber(text: string): string {
  const m = text.match(/(\d{3}-\d{2}-\d{5})/);
  return m ? m[1] : "";
}

function extractItemName(text: string): string {
  const m = text.match(/품목명[:\s]*([가-힣A-Za-z0-9\s]+)/);
  return m ? m[1].trim() : "";
}

function extractSpecification(text: string): string {
  const m = text.match(/규격[:\s]*([가-힣A-Za-z0-9×x*]+)/);
  return m ? m[1].trim() : "-";
}

function extractQty(text: string): string {
  const m = text.match(/수량[:\s]*([\d,]+)/);
  return m ? m[1].replace(/,/g, "") : "1";
}

function extractUnitPrice(text: string): string {
  const m = text.match(/단가[:\s]*([\d,]+)/);
  return m ? m[1] : "";
}

function extractSupplyPrice(text: string): string {
  const m = text.match(/공급가액[:\s]*([\d,]+)/);
  return m ? m[1] : "";
}

function extractTotal(text: string): string {
  const m = text.match(/합계금액[:\s]*([\d,]+)/);
  return m ? m[1] : "";
}
