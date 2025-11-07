"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ← Firebase 설정파일 불러오기
import { format } from "date-fns";

interface Sale {
  id: string;
  date: string;
  itemName: string;
  total: number;
  receiver: string;
}

// 날짜 포맷 함수
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "yy-MM-dd");
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const router = useRouter();

  // Firestore에서 매출 데이터 불러오기
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const q = query(collection(db, "sales"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[];

        setSales(data);
      } catch (error) {
        console.error("🔥 매출 내역 불러오기 오류:", error);
      }
    };

    fetchSales();
  }, []);

  const handleAddClick = () => router.push("/dashboard/sales/add");
  const handlePdfClick = () =>
    alert("📄 PDF에서 불러오기 기능은 준비 중입니다.");

  return (
    <div className="p-6">
      {/* 상단 타이틀 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">매출 관리</h1>
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

      {/* 매출 내역 테이블 */}
      {sales.length === 0 ? (
        <p className="text-gray-600">최근 한 달간 매출 내역이 없습니다.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">날짜</th>
              <th className="border px-4 py-2">품목</th>
              <th className="border px-4 py-2">합계금액</th>
              <th className="border px-4 py-2">받는자</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => (
              <tr
                key={item.id}
                className="text-center cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/dashboard/sales/${item.id}`)}
              >
                <td className="border px-4 py-2">
                  {formatDate(item.date)}
                </td>
                <td className="border px-4 py-2">{item.itemName}</td>
                <td className="border px-4 py-2 text-right">
                  {item.total.toLocaleString()}원
                </td>
                <td className="border px-4 py-2">{item.receiver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
