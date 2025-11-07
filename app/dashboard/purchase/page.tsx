"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Purchase {
  id: number;
  date: string; // yy-MM-dd 형식
  itemName: string;
  total: number;
  supplier: string;
}

// ✅ 한국어 날짜 포맷 헬퍼 함수
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "yy-MM-dd");
};

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Purchase[]>("/api/purchases");
        setPurchases(res.data);
      } catch (error) {
        console.error("매입내역 불러오기 오류:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddClick = () => router.push("/dashboard/purchase/add");
  const handlePdfClick = () =>
    alert("📄 PDF에서 불러오기 기능은 준비 중입니다.");

  return (
    <div className="p-6">
      {/* 상단 타이틀 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">매입 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            ➕ 직접 입력
          </button>
          <button
            onClick={handlePdfClick}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            📄 PDF에서 입력
          </button>
        </div>
      </div>

      {/* 매입 내역 테이블 */}
      {purchases.length === 0 ? (
        <p className="text-gray-600">최근 한 달간 매입 내역이 없습니다.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">날짜</th>
              <th className="border px-4 py-2">품목</th>
              <th className="border px-4 py-2">합계금액</th>
              <th className="border px-4 py-2">공급자</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((item) => (
              <tr
                key={item.id}
                className="text-center cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/dashboard/purchase/${item.id}`)}
              >
                <td className="border px-4 py-2">
                  {formatDate(item.date)}
                </td>
                <td className="border px-4 py-2">{item.itemName}</td>
                <td className="border px-4 py-2 text-right">
                  {item.total.toLocaleString()}원
                </td>
                <td className="border px-4 py-2">{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
