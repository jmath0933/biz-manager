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

  // ✅ 진행률 시뮬레이션
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
    formData.append("file", file);

    const res = await fetch("/api/invoice", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaved(true);
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

      {/* ✅ 진행률 표시줄 */}
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
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-32 font-semibold">{key}</label>
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
          ))}

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
