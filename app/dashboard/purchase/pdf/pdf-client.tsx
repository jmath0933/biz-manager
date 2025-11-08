"use client";

import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry"; // 브라우저용 PDF.js 워커 로드
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../../../firebase"; // ✅ 프로젝트의 Firebase 초기화 파일 경로에 맞게 조정

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"; // 혹은 CDN 가능

export default function PDFClient() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ PDF 파일 선택 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // ✅ 첫 페이지 썸네일 생성
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 🚫 타입 충돌 방지
    await firstPage.render({ canvasContext: context, viewport } as any).promise;

    // ✅ 썸네일 미리보기
    const imageUrl = canvas.toDataURL("image/png");
    setPreviewUrl(imageUrl);

    // ✅ 모든 페이지 텍스트 추출
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + "\n\n";
    }

    setTextContent(text.trim());

    // ✅ Firestore 저장 (썸네일 + 텍스트)
    const storage = getStorage(app);
    const firestore = getFirestore(app);
    const fileRef = ref(storage, `pdf-thumbnails/${file.name}.png`);

    // Firebase Storage에 썸네일 저장
    await uploadString(fileRef, imageUrl, "data_url");
    const downloadUrl = await getDownloadURL(fileRef);

    // Firestore에 메타데이터 저장
    await addDoc(collection(firestore, "purchases"), {
      filename: file.name,
      previewUrl: downloadUrl,
      extractedText: text,
      uploadedAt: new Date(),
    });

    alert("PDF 처리 및 저장이 완료되었습니다 ✅");
  };

  return (
    <div className="p-6 space-y-4">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="border rounded p-2"
      />

      {previewUrl && (
        <div>
          <p className="font-semibold text-gray-600 mb-2">썸네일 미리보기</p>
          <img src={previewUrl} alt="PDF Preview" className="border shadow-md rounded-lg" />
        </div>
      )}

      {textContent && (
        <div>
          <p className="font-semibold text-gray-600 mb-2">추출된 텍스트</p>
          <textarea
            value={textContent}
            readOnly
            rows={10}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
