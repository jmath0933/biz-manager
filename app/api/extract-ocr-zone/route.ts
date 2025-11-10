import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { createWorker } from "tesseract.js";
import sharp from "sharp";



// ✅ require 방식으로 변경


export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("파일이 없습니다.");

    const tempDir = path.join(process.cwd(), "temp");
    const pdfPath = path.join(tempDir, "input.pdf");
    const outputBase = path.join(tempDir, "page");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(pdfPath, buffer);

    // ✅ Poppler로 PDF → PNG 변환
    const popplerPath = "C:\\poppler-25.07.0\\Library\\bin";
    const pdftocairo = path.join(popplerPath, "pdftocairo.exe");

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(pdftocairo, ["-png", "-r", "600", "-antialias", "default", pdfPath, outputBase]);
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`pdftocairo 종료 코드: ${code}`))));
      proc.on("error", reject);
    });

    const imagePath = `${outputBase}-1.png`;
    console.log("📁 이미지 존재 여부:", fs.existsSync(imagePath));


    await sharp(imagePath)
  .grayscale()
  .threshold(180)
  .toFile(`${outputBase}-clean.png`);

     const image_Buffer = fs.readFileSync(`${outputBase}-clean.png`);




    // ✅ Tesseract.js 워커 생성
    const worker = await createWorker("kor+eng", 1, {
      logger: (m: any) => console.log("🔍 OCR 진행:", m),
    });

    const imageBuffer = fs.readFileSync(imagePath);
    const { data: { text } } = await worker.recognize(image_Buffer);

    
    await worker.terminate();

    console.log("✅ OCR 완료");
    console.log("📄 추출 텍스트:", text.substring(0, 300));

    // ✅ 텍스트 정리 (줄바꿈/공백 정돈)
const cleanText = text
  .replace(/[ \t]+/g, " ")
  .replace(/\n{2,}/g, "\n")
  .replace(/\r/g, "");

    const result = {
  공급자명: extractSupplier(cleanText),
  사업자등록번호: extractBusinessNo(cleanText),
  계산서번호: extractInvoiceNo(cleanText),
  발행일자: extractDate(cleanText),
  품목: extractItemName(cleanText),
  규격: extractSpecification(cleanText),
  수량: extractQty(cleanText),
  단가: extractUnitPrice(cleanText),
  공급가액: extractSupplyPrice(cleanText),
  세액: extractTax(cleanText),
  합계금액: extractTotal(cleanText),
};

    return NextResponse.json({ success: true, text: cleanText, data: result });
  } catch (error: any) {
    console.error("❌ OCR 처리 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// 📅 날짜 추출
function extractDate(text: string): string {
  const patterns = [
    /작성일자[\s\n]*(\d{4})[\s\n]*(\d{1,2})[\s\n]*(\d{1,2})/,
    /(\d{4})[\s\n]+(\d{1,2})[\s\n]+(\d{1,2})[\s\n]+\d{1,3},?\d{0,3}/,
    /(\d{4})[./-](\d{1,2})[./-](\d{1,2})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [_, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return "";
}

// 🏢 공급자 추출
function extractSupplier(text: string): string {
  const patterns = [
    /공[\s\n]*급[\s\n]*자[\s\S]{0,200}?상[\s\n]*호[\s\n]*\(?[\s\n]*법[\s\n]*인[\s\n]*명[\s\n]*\)?[\s\n]*([가-힣A-Za-z0-9()㈜]{2,30})[\s\n]+성명/,
    /공급자[\s\S]{0,150}상호[\s\n]*([가-힣A-Za-z0-9()㈜]{2,30})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const supplier = match[1].replace(/[\s\n]/g, '').trim();
      // 숫자로만 이루어진 경우나 등록번호 패턴 제외
      if (!/^\d+$/.test(supplier) && !/\d{3}-\d{2}-\d{5}/.test(supplier)) {
        return supplier;
      }
    }
  }
  return "";
}

// 🔢 사업자등록번호 추출
function extractBusinessNo(text: string): string {
  const patterns = [
    /등[\s\n]*록[\s\n]*번[\s\n]*호[\s\n]+(\d[\s\n]*\d[\s\n]*\d[\s\n]*-?[\s\n]*\d[\s\n]*\d[\s\n]*-?[\s\n]*\d[\s\n]*\d[\s\n]*\d[\s\n]*\d[\s\n]*\d)/,
    /공[\s\n]*급[\s\n]*자[\s\S]{0,50}(\d[\s\n]*\d[\s\n]*\d[\s\n]*-?[\s\n]*\d[\s\n]*\d[\s\n]*-?[\s\n]*\d[\s\n]*\d[\s\n]*\d[\s\n]*\d[\s\n]*\d)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/[\s\n]/g, "");
      if (cleaned.includes("-")) return cleaned;
      return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
    }
  }
  return "";
}

// 📋 계산서번호 추출
function extractInvoiceNo(text: string): string {
  const patterns = [
    /승인번호[\s\n]*:?[\s\n]*([A-Za-z0-9-]+)/,
    /관리번호[\s\n]*:?[\s\n]*([A-Za-z0-9]+)/,
    /(TX\d+)/,
    /(\d{8}-\d{8}-\d{8})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

// 📦 품목명 추출
function extractItemName(text: string): string {
  const patterns = [
    /월[\s\n]+일[\s\n]+품[\s\n]*목[\s\n]*명[\s\S]{0,20}?[\s\n]+(\d{1,2})[\s\n]+(\d{1,2})[\s\n]+([가-힣A-Za-z0-9]+)/,
    /품[\s\n]*목[\s\n]*명[\s\S]{0,50}?(\d{1,2})[\s\n]+(\d{1,2})[\s\n]+([가-힣A-Za-z0-9]{2,30})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const item = match[3] || match[1];
      if (item && !/^[\d\s]+$/.test(item) && !/(규격|수량|단가)/.test(item)) {
        return item.trim();
      }
    }
  }
  return "";
}

// 📏 규격 추출
function extractSpecification(text: string): string {
  const patterns = [
    /규[\s\n]*격[\s\n]+([가-힣A-Za-z0-9×x*-]+)[\s\n]+수[\s\n]*량/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].trim() && !/^\d+$/.test(match[1].trim())) {
      return match[1].trim();
    }
  }
  return "-";
}

// 🔢 수량 추출
function extractQty(text: string): string {
  const patterns = [
    /수[\s\n]*량[\s\n]+([\d,]+(?:\.\d+)?)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/,/g, "");
  }
  return "";
}

// 💵 단가 추출
function extractUnitPrice(text: string): string {
  const patterns = [
    /단[\s\n]*가[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 💰 공급가액 추출
function extractSupplyPrice(text: string): string {
  const patterns = [
    /공급가액[\s\n]+([\d,]+)/,
    /(\d{1,3}(?:,\d{3})+)[\s\n]+\d{1,3}(?:,\d{3})+/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 🧾 세액 추출
function extractTax(text: string): string {
  const patterns = [
    /세[\s\n]*액[\s\n]+([\d,]+)/,
    /공급가액[\s\n]+\d{1,3}(?:,\d{3})+[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 💳 합계금액 추출
function extractTotal(text: string): string {
  const patterns = [
    /합계금액[\s\n]+([\d,]+)/,
    /합[\s\n]*계[\s\n]*금[\s\n]*액[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  // 합계가 없으면 공급가액 + 세액으로 계산
  const supplyPrice = extractSupplyPrice(text);
  const tax = extractTax(text);
  if (supplyPrice && tax) {
    const supply = parseInt(supplyPrice.replace(/,/g, ""));
    const taxAmount = parseInt(tax.replace(/,/g, ""));
    return (supply + taxAmount).toLocaleString();
  }
  
  return "";
}