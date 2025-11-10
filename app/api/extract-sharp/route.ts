import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const popplerPath = "C:\\poppler-25.07.0\\Library\\bin";
    const pdftocairo = path.join(popplerPath, "pdftocairo.exe");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("파일이 없습니다.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = path.join(process.cwd(), "temp");
    await fs.mkdir(tempDir, { recursive: true });

    const inputPath = path.join(tempDir, "input.pdf");
    const outputBase = path.join(tempDir, "page");

    await fs.writeFile(inputPath, buffer);

    // PDF → PNG 변환
    await new Promise((resolve, reject) => {
      const args = ["-png", "-scale-to", "300", inputPath, outputBase];
      const proc = spawn(pdftocairo, args);
      proc.on("close", (code) => (code === 0 ? resolve(null) : reject(code)));
      proc.on("error", reject);
    });

    // OCR 처리
    let rawText = "";
    try {
      const ocr = await Tesseract.recognize(`${outputBase}-1.png`, "kor", {
        logger: (m) => console.log("🔍 OCR 진행:", m),
      });
      rawText = ocr.data.text;
      console.log("🧾 OCR 결과 텍스트:\n", rawText);
    } catch (ocrError) {
      console.error("❌ OCR 실패:", ocrError);
      throw new Error("OCR 처리 중 오류가 발생했습니다.");
    }

    const text = rawText.replace(/\s+/g, " ");

    // 정보 추출
    const parsed = {
      date: text.match(/작성일자.*?(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)?.slice(1).join("-"),
      supplier: text.match(/공급자.*?상 호.*?(\S+)/)?.[1],
      receiver: text.match(/수요자.*?상 호.*?(\S+)/)?.[1],
      itemName: text.match(/품 목 명.*?(\S+)/)?.[1],
      specification: text.match(/규 격.*?(\S+)/)?.[1] ?? "",
      qty: text.match(/수량.*?([\d,]+)/)?.[1] ?? "",
      unitPrice: text.match(/단가.*?([\d,]+)/)?.[1] ?? "",
      supplyPrice: text.match(/공급가액.*?([\d,]+)/)?.[1],
      tax: text.match(/세액.*?([\d,]+)/)?.[1],
      total: text.match(/합계금액.*?([\d,]+)/)?.[1],
      rawText: rawText, // ✅ OCR 원문도 함께 반환
    };

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("❌ 전체 처리 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
