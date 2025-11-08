"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useRouter } from "next/navigation";

// ✅ PDF.js 워커 설정 (Next.js 호환)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PurchasePdfUpload() {
  const router = useRouter();

  const [pdfText, setPdfText] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [tax, setTax] = useState<number | string>("");
  const [product, setProduct] = useState("");
  const [buyer, setBuyer] = useState("포항케이이씨");

  // ✅ PDF 텍스트 추출 함수
  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(" ");
    }
    return text;
  };

  // ✅ PDF 분석 함수 (정규식 기반)
  const parsePdfData = (text: string) => {
    // 사업자번호 (000-00-00000 형태)
    const bizMatch = text.match(/\d{3}-\d{2}-\d{5}/);
    // 공급가액
    const supplyMatch = text.match(/공급가액\s*([\d,]+)/);
    // 세액
    const taxMatch = text.match(/세액\s*([\d,]+)/);
    // 공급자명
    const supplierMatch = text.match(/공급자\s*[:：]?\s*([가-힣A-Za-z0-9㈜\s]+)/);
    // 품목
    const itemMatch = text.match(/품목\s*[:：]?\s*([가-힣A-Za-z0-9\s]+)/);

    setPdfText(text);
    setSupplierName(supplierMatch?.[1]?.trim() || "");
    setBizNo(bizMatch?.[0] || "");
    setPrice(supplyMatch ? parseInt(supplyMatch[1].replace(/,/g, "")) : "");
    setTax(taxMatch ? parseInt(taxMatch[1].replace(/,/g, "")) : "");
    setProduct(itemMatch?.[1]?.trim() || "");
  };

  // ✅ 파일 업로드 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await extractTextFromPdf(file);
    parsePdfData(text);
  };

  // ✅ 등록 처리
  const handleSubmit = () => {
    const newPurchase = {
      supplierName,
      bizNo,
      buyer,
      product,
      price,
      tax,
      total: Number(price) + Number(tax),
      date: new Date().toISOString().split("T")[0],
    };

    const existing = JSON.parse(localStorage.getItem("purchases") || "[]");
    existing.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(existing));

    alert("PDF 자동입력이 완료되었습니다 ✅");
    router.push("/dashboard/purchase");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📄 매입 PDF 자동입력</h1>

      {/* PDF 업로드 */}
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* 자동 채워진 입력 필드 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">수요자</label>
          <input
            type="text"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">공급자명</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">사업자번호</label>
          <input
            type="text"
            value={bizNo}
            onChange={(e) => setBizNo(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">품목</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">공급가액</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded w-full text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">세액</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="border p-2 rounded w-full text-right"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded font-semibold"
      >
        등록
      </button>

      {pdfText && (
        <details className="mt-6 text-xs text-gray-500">
          <summary className="cursor-pointer">PDF 원문 보기</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all">{pdfText}</pre>
        </details>
      )}
    </div>
  );
}
