// lib/pdfParser.ts
import * as pdfjsLib from "pdfjs-dist";

// ✅ PDF.js 워커 설정 (Vercel 배포용 포함)
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * PDF 세금계산서에서 주요 정보를 추출하는 함수
 * @param file - PDF File 객체
 * @returns 추출된 세금계산서 데이터 (buyer, date, supply, tax, total 등)
 */
export async function extractInvoiceData(file: File) {
  try {
    // 1️⃣ PDF 텍스트 전체 읽기
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(" ");
      fullText += textItems + "\n";
    }

    // 2️⃣ 주요 항목 정규식 파싱
    const buyerMatch = fullText.match(/받는자\s*[:：]?\s*([^\s]+)/);
    const dateMatch = fullText.match(/작성일자\s*[:：]?\s*(\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2})/);
    const supplyMatch = fullText.match(/공급가액\s*[:：]?\s*([\d,]+)/);
    const taxMatch = fullText.match(/세액\s*[:：]?\s*([\d,]+)/);
    const totalMatch = fullText.match(/합계금액\s*[:：]?\s*([\d,]+)/);

    // 3️⃣ 데이터 정리
    const buyer = buyerMatch?.[1]?.trim() ?? "";
    const date = dateMatch?.[1]?.replace(/[^\d.]/g, "") ?? "";
    const supply = parseInt((supplyMatch?.[1] ?? "0").replace(/,/g, ""), 10);
    const tax = parseInt((taxMatch?.[1] ?? "0").replace(/,/g, ""), 10);
    const total = parseInt((totalMatch?.[1] ?? "0").replace(/,/g, ""), 10);
    const isPurchase = buyer.includes("김정구");

    // 4️⃣ 결과 반환
    return {
      buyer,
      date,
      supply,
      tax,
      total,
      isPurchase,
      rawText: fullText,
    };
  } catch (error) {
    console.error("PDF 파싱 오류:", error);
    throw new Error("PDF를 읽는 중 문제가 발생했습니다. 파일 형식을 확인하세요.");
  }
}
