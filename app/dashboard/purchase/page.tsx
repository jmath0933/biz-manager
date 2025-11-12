"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  where,
  query,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { format } from "date-fns";

interface Purchase {
  id: string;
  date: string;
  itemName: string;
  total: number;
  supplier: string;
}

// ✅ 날짜 포맷 함수
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "yy-MM-dd");
};

// ✅ 기본 날짜: 오늘 ~ 30일 전
const getDefaultDates = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
};

export default function PurchasePage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [startDate, setStartDate] = useState(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState(getDefaultDates().endDate);
  const [totalAmount, setTotalAmount] = useState(0);
  const [count, setCount] = useState(0);

  // ✅ 매입 데이터 불러오기
  const fetchPurchases = async (start: string, end: string) => {
    try {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      endDateObj.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "purchases"),
        where("date", ">=", startDateObj.toISOString()),
        where("date", "<=", endDateObj.toISOString()),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Purchase[];

      setPurchases(data);
      setCount(data.length);

      const total = data.reduce((sum, p) => sum + (p.total || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("🔥 매입 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    fetchPurchases(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <div className="p-6">
      {/* ✅ 상단 타이틀 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-xl font-bold">매입 관리</h1>
      </div>

      {/* ✅ 날짜 필터 + 합계 */}
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
          총 매입금액:&nbsp;
          <span className="text-blue-600 text-base text-center inline-block min-w-[150px]">
            {totalAmount.toLocaleString()}원
          </span>
          <span className="ml-4 text-gray-700 text-sm">
            (매입 건수: {count}건)
          </span>
        </div>
      </div>

      {/* ✅ 매입 내역 테이블 */}
      {purchases.length === 0 ? (
        <p className="text-gray-600">해당 기간 내 매입 내역이 없습니다.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-center w-[100px] max-w-[110px]">
                날짜
              </th>
              <th className="border px-3 py-2">품목</th>
              <th className="border px-3 py-2 text-center w-[130px] max-w-[140px]">
                합계금액
              </th>
              <th className="border px-3 py-2">공급자</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr
                key={p.id}
                className="text-center cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/dashboard/purchase/${p.id}`)}
              >
                <td className="border px-3 py-2 whitespace-nowrap text-center">
                  {formatDate(p.date)}
                </td>
                <td className="border px-3 py-2 text-left truncate">
                  {p.itemName}
                </td>
                <td className="border px-3 py-2 text-right whitespace-nowrap">
                  {p.total.toLocaleString()}원
                </td>
                <td className="border px-3 py-2">{p.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
