"use client";

import { useState } from "react";
import axios from "axios";

interface OcrResult {
  공급자명?: string;
  사업자등록번호?: string;
  계산서번호?: string;
  발행일자?: string;
  품목?: string;
  수량?: string;
  단가?: string;
  공급가액?: string;
  세액?: string;
  합계금액?: string;
  error?: string;
  status?: string;
  name?: string;
}

export default function PdfUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<OcrResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ 파일 업로드 & 처리
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const selectedFiles = Array.from(fileList);
    setFiles(selectedFiles);
    await processFiles(selectedFiles);
  };

  // ✅ 파일 처리 함수
  const processFiles = async (selectedFiles: File[]) => {
    setLoading(true);
    setResults([]);
    let done = 0;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // 🔹 axios 응답 타입 명시 (Vercel 빌드 오류 방지)
        const res = await axios.post<{ data: OcrResult }>(
          "/api/extract-ocr-zone",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const data = res.data?.data || {};
        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            ...data,
            status: "✅ 완료",
          },
        ]);
      } catch (err) {
        console.error(err);
        setResults((prev) => [
          ...prev,
          { name: file.name, error: "❌ 추출 실패" },
        ]);
      }

      done++;
      setProgress(Math.round((done / selectedFiles.length) * 100));
    }

    setLoading(false);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-xl font-bold mb-4">📄 OCR 세금계산서 자동 분석</h1>

      {/* ✅ 드래그 앤 드롭 업로드 영역 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("fileInput")?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <p className="text-gray-600">
          여기에 PDF를 드래그하거나 클릭하여 업로드하세요.
        </p>
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ✅ 진행 표시줄 */}
      {loading && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-4 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* ✅ 결과 테이블 */}
      {results.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">📑 추출 결과</h2>
          <table className="w-full text-sm border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">파일명</th>
                <th className="border px-2 py-1">공급자명</th>
                <th className="border px-2 py-1">사업자등록번호</th>
                <th className="border px-2 py-1">계산서번호</th>
                <th className="border px-2 py-1">발행일자</th>
                <th className="border px-2 py-1">품목</th>
                <th className="border px-2 py-1">수량</th>
                <th className="border px-2 py-1">단가</th>
                <th className="border px-2 py-1">공급가액</th>
                <th className="border px-2 py-1">세액</th>
                <th className="border px-2 py-1">합계금액</th>
                <th className="border px-2 py-1">상태</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{r.name}</td>
                  <td className="border px-2 py-1">{r.공급자명 || "-"}</td>
                  <td className="border px-2 py-1">{r.사업자등록번호 || "-"}</td>
                  <td className="border px-2 py-1">{r.계산서번호 || "-"}</td>
                  <td className="border px-2 py-1">{r.발행일자 || "-"}</td>
                  <td className="border px-2 py-1">{r.품목 || "-"}</td>
                  <td className="border px-2 py-1 text-right">{r.수량 || "-"}</td>
                  <td className="border px-2 py-1 text-right">{r.단가 || "-"}</td>
                  <td className="border px-2 py-1 text-right">{r.공급가액 || "-"}</td>
                  <td className="border px-2 py-1 text-right">{r.세액 || "-"}</td>
                  <td className="border px-2 py-1 text-right">{r.합계금액 || "-"}</td>
                  <td className="border px-2 py-1 text-center">
                    {r.error || r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
