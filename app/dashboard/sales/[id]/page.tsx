"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SaleDetail {
  id: string;
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

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<SaleDetail | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const ref = doc(db, "sales", id as string);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setSale({ id: snapshot.id, ...snapshot.data() } as SaleDetail);
        } else {
          console.warn("해당 매출 데이터를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("매출 상세보기 오류:", error);
      }
    };

    fetchSale();
  }, [id]);

  if (!sale) return <p className="p-6">불러오는 중...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 bg-gray-300 px-3 py-1 rounded"
      >
        ← 목록으로
      </button>

      <h1 className="text-xl font-bold mb-4">매출 상세정보</h1>

      <table className="min-w-[400px] border text-left">
        <tbody>
          <tr>
            <th className="border px-3 py-2">날짜</th>
            <td className="border px-3 py-2">
              {sale.date
                ? new Date(sale.date).toLocaleDateString("ko-KR")
                : ""}
            </td>
          </tr>
          <tr>
            <th className="border px-3 py-2">품목</th>
            <td className="border px-3 py-2">{sale.itemName}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2">규격</th>
            <td className="border px-3 py-2">{sale.spec}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2">수량</th>
            <td className="border px-3 py-2">{sale.qty}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2">단가</th>
            <td className="border px-3 py-2">
              {sale.unitPrice?.toLocaleString()}원
            </td>
          </tr>
          <tr>
            <th className="border px-3 py-2">공급가액</th>
            <td className="border px-3 py-2">
              {sale.supplyPrice?.toLocaleString()}원
            </td>
          </tr>
          <tr>
            <th className="border px-3 py-2">세액</th>
            <td className="border px-3 py-2">
              {sale.tax?.toLocaleString()}원
            </td>
          </tr>
          <tr>
            <th className="border px-3 py-2">합계금액</th>
            <td className="border px-3 py-2 font-semibold">
              {sale.total?.toLocaleString()}원
            </td>
          </tr>
          <tr>
            <th className="border px-3 py-2">공급자</th>
            <td className="border px-3 py-2">{sale.supplier}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2">받는자</th>
            <td className="border px-3 py-2">{sale.receiver}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
