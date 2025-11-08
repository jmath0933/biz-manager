"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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

// 오늘 날짜와 30일 전 구하기
const getDefaultDates = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState(getDefaultDates().endDate);
  const [totalAmount, setTotalAmount] = useState(0);
  const router = useRouter();

  // 매출 데이터 불러오기
  const fetchSales = async (start: string, end: string) => {
    try {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      endDateObj.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "sales"),
        where("date", ">=", startDateObj.toISOString()),
        where("date", "<=", endDateObj.toISOString()),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      setSales(data);

      // 합계 계산
      const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("🔥 매출 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    fetchSales(startDate, endDate);
  }, [startDate, endDate]);

  const handleAddClick = () => router.push("/dashboard/sales/add");
  const handlePdfClick = () =>
    alert("📄 PDF에서 불러오기 기능은 준비 중입니다.");

  return (
    <div className="p-6">
      {/* 상단 타이틀 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
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

      {/* 날짜 선택 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <span>~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />

        <div className="ml-auto text-sm font-semibold bg-blue-50 px-4 py-2 rounded-lg">
          총 매출금액:&nbsp;
          <span className="text-blue-600 text-base text-center inline-block min-w-[150px]">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 매출 내역 테이블 */}
      {sales.length === 0 ? (
        <p className="text-gray-600">해당 기간 내 매출 내역이 없습니다.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-center w-[110px] max-w-[100px]">
                날짜
              </th>
              <th className="border px-3 py-2">품목</th>
              <th className="border px-3 py-2 text-right w-[130px] max-w-[140px]">
                합계금액
              </th>
              <th className="border px-3 py-2">받는자</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => (
              <tr
                key={item.id}
                className="text-center cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/dashboard/sales/${item.id}`)}
              >
                <td className="border px-3 py-2 whitespace-nowrap text-center">
                  {formatDate(item.date)}
                </td>
                <td className="border px-3 py-2 text-left truncate">
                  {item.itemName}
                </td>
                <td className="border px-3 py-2 text-right whitespace-nowrap">
                  {item.total.toLocaleString()}원
                </td>
                <td className="border px-3 py-2">{item.receiver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
