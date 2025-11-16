"use client";

import React, { useState, useEffect } from "react";

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

export default function PdfAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [editingField, setEditingField] = useState<keyof ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);

  const labelMap: Record<keyof ExtractedData, string> = {
    date: "작성일자",
    supplier: "공급자",
    customer: "수요자",
    item: "품목명",
    spec: "규격",
    unitPrice: "단가",
    quantity: "수량",
    supplyValue: "공급가액",
    tax: "세액",
    totalAmount: "합계금액",
  };

  const classifyInvoice = (supplier: string, customer: string) => {
    const normalize = (name: string) => {
      if (!name) return "";
      if (name.includes("포항케이이씨")) return "포항케이이씨";
      if (name.includes("케이이씨")) return "케이이씨";
      return name;
    };

    const s = normalize(supplier);
    const c = normalize(customer);

    if ((s === "포항케이이씨" && c === "케이이씨") || (s === "케이이씨" && c === "포항케이이씨")) {
      return { 저장위치: s === "포항케이이씨" ? "매출" : "매입" };
    }
    if (s === "포항케이이씨" || c === "포항케이이씨") {
      return { 저장위치: s === "포항케이이씨" ? "매출" : "매입" };
    }
    if (s === "케이이씨" || c === "케이이씨") {
      return { 저장위치: s === "케이이씨" ? "매출" : "매입" };
    }
    return { 저장위치: "기타" };
  };

  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [loading]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setSaved(false);

    const formData = new FormData();
    formData.append("file", file); // 분석 요청

    const res = await fetch("/api/invoice", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setLoading(true);
    setSaved(false);

    const formData = new FormData();
    formData.append("data", JSON.stringify(data)); // 저장 요청
    formData.append("save", "true");

    const res = await fetch("/api/invoice", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    setSaved(true);
    setLoading(false);
  };

  const handleFieldChange = (field: keyof ExtractedData, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
    setEditingField(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📄 세금계산서 분석기</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2"
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "분석 중..." : "GPT 분석"}
      </button>

      {loading && (
        <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-800">
            분류: {classifyInvoice(data.supplier, data.customer).저장위치}
          </div>

          {Object.entries(data).map(([key, value]) => {
            const label = labelMap[key as keyof ExtractedData] || key;
            return (
              <div key={key} className="flex items-center gap-4">
                <label className="w-32 font-semibold">{label}</label>
                {editingField === key ? (
                  <input
                    value={value}
                    onChange={(e) =>
                      handleFieldChange(key as keyof ExtractedData, e.target.value)
                    }
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  <>
                    <span className="flex-1">{value}</span>
                    <button
                      onClick={() => setEditingField(key as keyof ExtractedData)}
                      className="text-sm text-blue-500 underline"
                    >
                      수정
                    </button>
                  </>
                )}
              </div>
            );
          })}

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            결과 저장
          </button>

          {saved && <p className="text-green-600">✅ 저장 완료!</p>}
        </div>
      )}
    </div>
  );
}
