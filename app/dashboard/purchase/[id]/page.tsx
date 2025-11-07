"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface PurchaseDetail {
  id: number;
  date: string;
  itemName: string;
  spec: string;
  qty: number;
  unitPrice: number;
  supplyPrice: number;
  tax: number;
  total: number;
  supplier: string;
  receiver: string;
}

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<PurchaseDetail>(`/api/purchases/${id}`);
        setPurchase(res.data);
      } catch (error) {
        console.error("상세보기 오류:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!purchase) return <p className="p-6">불러오는 중...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 bg-gray-300 px-3 py-1 rounded"
      >
        ← 목록으로
      </button>

      <h1 className="text-xl font-bold mb-4">매입 상세정보</h1>

      <table className="min-w-[400px] border text-left">
        <tbody>
          <tr><th className="border px-3 py-2">날짜</th><td className="border px-3 py-2">{purchase.date}</td></tr>
          <tr><th className="border px-3 py-2">품목</th><td className="border px-3 py-2">{purchase.itemName}</td></tr>
          <tr><th className="border px-3 py-2">규격</th><td className="border px-3 py-2">{purchase.spec}</td></tr>
          <tr><th className="border px-3 py-2">수량</th><td className="border px-3 py-2">{purchase.qty}</td></tr>
          <tr><th className="border px-3 py-2">단가</th><td className="border px-3 py-2">{purchase.unitPrice.toLocaleString()}원</td></tr>
          <tr><th className="border px-3 py-2">공급가액</th><td className="border px-3 py-2">{purchase.supplyPrice.toLocaleString()}원</td></tr>
          <tr><th className="border px-3 py-2">세액</th><td className="border px-3 py-2">{purchase.tax.toLocaleString()}원</td></tr>
          <tr><th className="border px-3 py-2">합계금액</th><td className="border px-3 py-2 font-semibold">{purchase.total.toLocaleString()}원</td></tr>
          <tr><th className="border px-3 py-2">공급자</th><td className="border px-3 py-2">{purchase.supplier}</td></tr>
          <tr><th className="border px-3 py-2">받는자</th><td className="border px-3 py-2">{purchase.receiver}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
