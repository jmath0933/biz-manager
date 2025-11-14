"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";


export default function PdfPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ PDF.js worker 설정
   

    // ✅ PDF 로드
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // ✅ 첫 페이지 미리보기 렌더링
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await firstPage.render({
      canvasContext: context,
      viewport,
    } as any).promise; // 🔧 타입 경고 방지

    const imageUrl = canvas.toDataURL("image/png");
    setPreviewUrl(imageUrl);

    // ✅ 모든 페이지의 텍스트 추출
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    setTextContent(fullText.trim());
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📄 PDF 업로드 및 텍스트 추출</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />

      {previewUrl && (
        <div>
          <h2 className="text-xl font-semibold mt-4 mb-2">미리보기</h2>
          <img src={previewUrl} alt="PDF 미리보기" className="border rounded shadow" />
        </div>
      )}

      {textContent && (
        <div>
          <h2 className="text-xl font-semibold mt-4 mb-2">텍스트 내용</h2>
          <textarea
            value={textContent}
            readOnly
            className="w-full h-80 border p-3 rounded"
          />
        </div>
      )}
    </div>
  );
}
