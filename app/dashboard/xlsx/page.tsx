'use client';

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

interface UploadResult {
  index: number;
  type: string;
  partner: string;
  date: string;
  total: number;
  fileUrl: string;
}

interface UploadError {
  index: number;
  error: string;
  supplierBiz?: string;
  buyerBiz?: string;
}

interface ApiResponse {
  ok: boolean;
  results?: UploadResult[];
  errors?: UploadError[];
  summary?: {
    total: number;
    success: number;
    failed: number;
  };
  message?: string;
  duplicate?: boolean;
  error?: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("파일을 선택하세요");

    setUploading(true);
    setProgress(0);
    setResponse(null);

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/invoice-tax");

    // 업로드 진행률
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        setResponse(json);
      } catch {
        setResponse({
          ok: false,
          error: "서버 응답 파싱 오류"
        });
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      setResponse({
        ok: false,
        error: "업로드 실패"
      });
      setUploading(false);
    };

    xhr.send(form);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 파일 크기 체크 (예: 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("파일 크기가 너무 큽니다 (최대 50MB)");
        return;
      }
      setFile(selectedFile);
      setResponse(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          세금계산서 업로드
        </h1>
        <p className="text-gray-600">
          국세청에서 다운로드한 세금계산서 엑셀 파일을 업로드하세요
        </p>
      </div>

      {/* 업로드 폼 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              엑셀 파일 선택 (.xlsx)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <FileSpreadsheet className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : "파일 선택..."}
                </span>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    업로드
                  </>
                )}
              </button>
            </div>
            {file && (
              <p className="text-xs text-gray-500 mt-2">
                파일 크기: {(file.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>

          {/* 진행률 표시 */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>업로드 진행률</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 결과 표시 */}
      {response && (
        <div className="space-y-4">
          {/* 요약 */}
          {response.ok && response.summary && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                처리 결과 요약
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">
                    {response.summary.total}
                  </div>
                  <div className="text-sm text-gray-500">총 시트</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {response.summary.success}
                  </div>
                  <div className="text-sm text-green-600">성공</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {response.summary.failed}
                  </div>
                  <div className="text-sm text-red-600">실패</div>
                </div>
              </div>
            </div>
          )}

          {/* 중복 파일 */}
          {response.duplicate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  이미 처리된 파일입니다
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {response.message}
                </p>
              </div>
            </div>
          )}

          {/* 에러 */}
          {!response.ok && response.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">오류 발생</p>
                <p className="text-sm text-red-700 mt-1">{response.error}</p>
              </div>
            </div>
          )}

          {/* 성공한 항목들 */}
          {response.results && response.results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                처리 성공 ({response.results.length}건)
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {response.results.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            item.type === "매입"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="ml-2 font-semibold text-gray-800">
                          {item.partner}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold ${
                        item.total < 0 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {item.total < 0 && '▲ '}
                        {Math.abs(item.total).toLocaleString()}원
                        {item.total < 0 && ' (수정)'}
                      </span>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        파일 보기 →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 실패한 항목들 */}
          {response.errors && response.errors.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                처리 실패 ({response.errors.length}건)
              </h2>
              <div className="space-y-2">
                {response.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="border border-red-200 rounded-lg p-3 bg-red-50"
                  >
                    <p className="text-sm font-medium text-red-800">
                      시트 {err.index + 1}: {err.error}
                    </p>
                    {err.supplierBiz && err.buyerBiz && (
                      <p className="text-xs text-red-600 mt-1">
                        공급자: {err.supplierBiz} / 수요자: {err.buyerBiz}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}