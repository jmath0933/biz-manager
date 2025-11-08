"use client";

import React, { useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import * as pdfjsLib from "pdfjs-dist";

// ✅ 브라우저 전용 PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFUploadClient() {
  const [textContent, setTextContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + "\n\n";
    }
    setTextContent(text.trim());
  };

  const handleSave = async () => {
    if (!textContent) return alert("먼저 PDF를 업로드하세요.");
    try {
      setUploading(true);
      const docRef = await addDoc(collection(db, "purchase_docs"), {
        content: textContent,
        createdAt: Timestamp.now(),
      });
      alert("Firestore에 저장 완료!");
      router.push(`/dashboard/purchase/${docRef.id}`);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">PDF 텍스트 추출 및 업로드</h1>

      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          PDF 선택
        </button>
        <button
          onClick={handleSave}
          disabled={!textContent || uploading}
          className={`px-4 py-2 rounded-lg ${
            uploading || !textContent
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {uploading ? "저장 중..." : "Firestore에 저장"}
        </button>
      </div>

      {textContent && (
        <textarea
          readOnly
          value={textContent}
          className="w-full h-96 border rounded-lg p-4 bg-gray-50 text-sm font-mono"
        />
      )}
    </div>
  );
}
