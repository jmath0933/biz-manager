"use client";

import React from "react";
import dynamic from "next/dynamic";

// ✅ pdfjs-dist는 dynamic import로 클라이언트에서만 불러옴
const PDFPageInner = dynamic(() => import("./pdf-client"), {
  ssr: false,
  loading: () => <p className="p-4 text-gray-500">PDF 모듈 로딩 중...</p>,
});

export default function PDFPage() {
  return <PDFPageInner />;
}
