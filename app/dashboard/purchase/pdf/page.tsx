"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// ✅ pdf.js 워커 경로 (CDN 방식, Next.js에서 안전)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function AddPurchasePdfPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  /** ✅ PDF 텍스트 추출 함수 */
  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(" ") + "\n";
    }
    return text;
  };

  /** ✅ 추출된 텍스트를 매입 데이터로 변환 */
  const parsePurchaseData = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // 품목명은 첫 줄 기준
    const itemLines = lines.filter((l) => l.match(/[가-힣A-Za-z]/));
    const firstItem = itemLines[0] || "품목없음";

    const itemCount = itemLines.length > 1 ? itemLines.length - 1 : 0;
    const itemName = itemCount > 0 ? `${firstItem} 외 ${itemCount}건` : firstItem;

    // 금액 파싱
    const numbers = lines
      .map((l) => l.replace(/[^\d]/g, ""))
      .filter((v) => v.length > 3)
      .map((v) => parseInt(v, 10));

    const total = numbers.length ? numbers[numbers.length - 1] : 0;
    const supplyPrice = Math.round(total / 1.1);
    const tax = total - supplyPrice;

    return {
      itemName,
      qty: 1,
      unitPrice: supplyPrice,
      supplyPrice,
      tax,
      total,
      supplier: "공급자 미확인",
      receiver: "포항케이이씨", // ✅ 디폴트 수요자
      date: new Date().toISOString().split("T")[0],
    };
  };

  /** ✅ 여러 PDF 순차 처리 및 Firestore 저장 */
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    const newResults: any[] = [];

    for (const file of Array.from(files)) {
      try {
        const text = await extractTextFromPdf(file);
        const data = parsePurchaseData(text);

        await addDoc(collection(db, "purchases"), {
          ...data,
          createdAt: Timestamp.now(),
        });

        newResults.push({ name: file.name, status: "✅ 등록 완료", ...data });
      } catch (err) {
        console.error(err);
        newResults.push({ name: file.name, status: "❌ 오류 발생" });
      }
    }

    setResults(newResults);
    setLoading(false);

    // ✅ 처리 완료 후 매입관리로 이동
    alert("PDF 매입 등록이 완료되었습니다.");
    router.push("/dashboard/purchase");
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-xl font-bold mb-4">📄 PDF 자동 매입 등록</h1>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="mb-3 text-gray-600">
          여러 개의 매입 PDF를 선택하면 순차적으로 자동 처리됩니다.
        </p>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={loading}
          className="hidden"
          id="pdfUpload"
        />
        <label
          htmlFor="pdfUpload"
          className={`cursor-pointer px-4 py-2 rounded-md text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "처리 중..." : "📎 PDF 파일 선택"}
        </label>
      </div>

      {/* ✅ 처리 결과 표시 */}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">📑 처리 결과</h2>
          <ul className="text-sm space-y-1">
            {results.map((r, idx) => (
              <li key={idx} className="border-b py-1 flex justify-between">
                <span>{r.name}</span>
                <span>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
