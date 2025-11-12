"use client";
import React, { useState, useRef } from "react";
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

const labels: Record<keyof ExtractedData, string> = {
  date: "작성일자",
  supplier: "공급자",
  customer: "수요자",
  item: "품목",
  spec: "규격",
  unitPrice: "단가",
  quantity: "수량",
  supplyValue: "공급가액",
  tax: "세액",
  totalAmount: "합계금액",
};

export default function PdfPage() {
  const [file, setFile] = useState<File | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("PDF 파일을 선택해주세요.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post<{ data: Partial<ExtractedData> }>(
        "/api/invoice",
        formData
      );

      const extracted = res.data?.data || {};

      setData((prev) => ({
        ...prev,
        ...extracted
      }));
    } catch (error) {
      console.error("분석 오류:", error);
      alert("PDF 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ExtractedData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("저장된 데이터:", data);
    alert("데이터가 콘솔에 저장되었습니다.");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">세금계산서 PDF 분석</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      <button
        onClick={handleFileButtonClick}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-4"
      >
        PDF 파일 선택
      </button>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "분석 중..." : "GPT로 분석하기"}
      </button>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              {labels[key as keyof ExtractedData]}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) =>
                handleChange(key as keyof ExtractedData, e.target.value)
              }
              className="border border-gray-300 rounded p-2"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        결과 저장
      </button>
    </div>
  );
}
