import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    // 파일 수신
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("파일이 없습니다.");

    // 임시 디렉토리 및 경로 준비
    const tempDir = path.join(process.cwd(), "temp");
    const pdfPath = path.join(tempDir, "input.pdf");
    const outputBase = path.join(tempDir, "page");
    fs.mkdirSync(tempDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(pdfPath, buffer);

    console.log("📄 PDF 저장 완료:", pdfPath);

    // ✅ Poppler: PDF → PNG 변환
    const popplerPath = "C:\\poppler-25.07.0\\Library\\bin";
    const pdftocairo = path.join(popplerPath, "pdftocairo.exe");

    console.log("🔄 PDF를 이미지로 변환 중...");
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(pdftocairo, ["-png", "-r", "300", pdfPath, outputBase]);
      proc.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`pdftocairo 종료 코드: ${code}`))
      );
      proc.on("error", reject);
    });

    const imagePath = `${outputBase}-1.png`;
    if (!fs.existsSync(imagePath)) throw new Error("이미지 변환 실패");
    
    console.log("✅ 이미지 변환 완료:", imagePath);

    // ✅ Python Google Vision OCR 실행
    const pythonPath = "C:\\Python314\\python.exe";
    const scriptPath = path.join(process.cwd(), "python", "ocr_vision.py");

    console.log("🔍 Google Vision OCR 시작...");
    
    const ocrResult = await new Promise<string>((resolve, reject) => {
      const proc = spawn(pythonPath, [scriptPath, imagePath], {
        env: { 
          ...process.env,
          PYTHONIOENCODING: 'utf-8'  // Python 출력 인코딩 설정
        }
      });
      
      const chunks: Buffer[] = [];
      let errorOutput = "";

      proc.stdout.on("data", (data) => {
        chunks.push(data);
      });
      
      proc.stderr.on("data", (data) => {
        errorOutput += data.toString("utf8");
        console.log("Python stderr:", data.toString("utf8"));
      });
      
      proc.on("close", (code) => {
        if (code === 0) {
          const fullBuffer = Buffer.concat(chunks);
          const text = fullBuffer.toString("utf8");
          resolve(text);
        } else {
          reject(new Error(`Python 종료 코드 ${code}: ${errorOutput}`));
        }
      });
      
      proc.on("error", reject);
    });

    console.log("📝 OCR 원본 출력:", ocrResult.substring(0, 200));

    const parsed = JSON.parse(ocrResult);
    const text = parsed.text;
    
    console.log("✅ Google Vision OCR 완료");
    console.log("📄 추출된 텍스트 (처음 500자):", text.substring(0, 500));

    // ✅ 텍스트 정리
    const cleanText = text
      .replace(/[ \t]+/g, " ")
      .replace(/\r/g, "")
      .trim();

    // ✅ OCR 데이터 추출 (항상 10개)
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

    console.log("✅ 최종 추출 결과:", result);

    return NextResponse.json({ success: true, data: result });
    
  } catch (error: any) {
    console.error("❌ OCR 처리 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* =========================================================
   🧩 정규식 기반 필드 추출
========================================================= */

// 📅 날짜
function extractDate(text: string): string {
  const patterns = [
    /작성일자[\s\n]*(\d{4})[\s\n]+(\d{1,2})[\s\n]+(\d{1,2})/,
    /(20\d{2})[.\-\/\s]+(\d{1,2})[.\-\/\s]+(\d{1,2})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [, y, m, d] = match;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return "";
}

// 🏢 공급자명
function extractSupplier(text: string): string {
  const patterns = [
    /공급자[\s\S]{0,200}상호[\s\n]*\(?법인명\)?[\s\n]*([가-힣A-Za-z0-9㈜()]+)[\s\n]+성명/,
    /공급자[\s\S]{0,150}상호[\s\n]*([가-힣A-Za-z0-9㈜()]{2,30})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const supplier = match[1].trim();
      if (!/^\d+$/.test(supplier) && !/\d{3}-\d{2}-\d{5}/.test(supplier)) {
        return supplier;
      }
    }
  }
  return "";
}

// 🔢 사업자등록번호
function extractBusinessNo(text: string): string {
  const patterns = [
    /등록번호[\s\n]+(\d{3}[\s\n]*-?[\s\n]*\d{2}[\s\n]*-?[\s\n]*\d{5})/,
    /(\d{3}[\s\n]*-[\s\n]*\d{2}[\s\n]*-[\s\n]*\d{5})/,
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

// 📋 계산서번호
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

// 🧾 공급받는자
function extractBuyer(text: string): string {
  const patterns = [
    /공급받는자[\s\S]{0,200}상호[\s\n]*\(?법인명\)?[\s\n]*([가-힣A-Za-z0-9㈜()]+)[\s\n]+성명/,
    /공급받는자[\s\S]{0,150}상호[\s\n]*([가-힣A-Za-z0-9㈜()]{2,30})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const buyer = match[1].trim();
      if (!/^\d+$/.test(buyer) && !/\d{3}-\d{2}-\d{5}/.test(buyer)) {
        return buyer;
      }
    }
  }
  return "";
}

// 📦 품목명
function extractItemName(text: string): string {
  const patterns = [
    /품목명[\s\n]+([\w가-힣A-Za-z0-9]+)/,
    /월[\s\n]+일[\s\n]+품목명[\s\S]{0,50}(\d{1,2})[\s\n]+(\d{1,2})[\s\n]+([가-힣A-Za-z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const item = match[3] || match[1];
      if (item && !/^\d+$/.test(item) && !/(규격|수량|단가)/.test(item)) {
        return item.trim();
      }
    }
  }
  return "";
}

// 📏 규격
function extractSpecification(text: string): string {
  const patterns = [
    /규격[\s\n]+([\w×x*-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].trim() && !/^\d+$/.test(match[1].trim())) {
      return match[1].trim();
    }
  }
  return "-";
}

// 🔢 수량
function extractQty(text: string): string {
  const patterns = [
    /수량[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/,/g, "");
  }
  return "";
}

// 💵 단가
function extractUnitPrice(text: string): string {
  const patterns = [
    /단가[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 💰 공급가액
function extractSupplyPrice(text: string): string {
  const patterns = [
    /공급가액[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 💸 세액
function extractTax(text: string): string {
  const patterns = [
    /세액[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// 💳 합계금액
function extractTotal(text: string): string {
  const patterns = [
    /합계금액[\s\n]+([\d,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  // 합계가 없으면 계산
  const supply = extractSupplyPrice(text);
  const tax = extractTax(text);
  if (supply && tax) {
    const total = parseInt(supply.replace(/,/g, "")) + parseInt(tax.replace(/,/g, ""));
    return total.toLocaleString();
  }
  
  return "";
}