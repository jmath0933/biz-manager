"use client";

import React, { useState } from "react";
import axios from "axios";
interface ExtractedData {
  date: string;
  supplier: string;
  customer: string;
  item: string;
  spec: string;
  unitPrice: string;
  quantity: string;
  supplyValue: string;
  tax: string;
  totalAmount: string;
}

export default function PdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExtractedData>({
    date: "",
    supplier: "",
    customer: "",
    item: "",
    spec: "",
    unitPrice: "",
    quantity: "",
    supplyValue: "",
    tax: "",
    totalAmount: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("PDF 파일을 선택해주세요.");

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post<{ data: any }>(
  "/api/extract-ocr-zone",
  formData,
  {
    headers: { "Content-Type": "multipart/form-data" },
    // ✅ axios 버전 상관없이 안전한 방식
    onUploadProgress: (event: ProgressEvent) => {
      if (event.total) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  } as any // 타입 충돌 방지
);

      setData(res.data?.data || data);
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("PDF 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ExtractedData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">세금계산서 PDF 분석</h1>

      {/* PDF 업로드 */}
      <div className="mb-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? `업로드 중... (${progress}%)` : "PDF 업로드 및 분석"}
      </button>

      {/* 결과 필드 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{key}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key as keyof ExtractedData, e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
