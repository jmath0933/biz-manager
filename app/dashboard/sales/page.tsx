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
import { db } from "@/lib/firebase";
import { format } from "date-fns";

interface Sale {
  id: string;
  date: number; // YYMMDD 형식
  item: string;
  totalAmount: string;
  customer: string;
}

// ✅ 숫자 → 날짜 문자열 변환
const formatDate = (code: number) => {
  const str = code.toString().padStart(6, "0");
  return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
};

// ✅ 기본 날짜: 최근 30일
const getDefaultDates = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
};

// ✅ 날짜 문자열 → YYMMDD 숫자 변환
const toDateCode = (dateStr: string) => {
  const d = new Date(dateStr);
  const yy = d.getFullYear().toString().slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return parseInt(`${yy}${mm}${dd}`);
};

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState(getDefaultDates().endDate);
  const [totalAmount, setTotalAmount] = useState(0);
  const [count, setCount] = useState(0);

  // ✅ Firestore에서 매출 내역 불러오기
  const fetchSales = async (start: string, end: string) => {
    try {
      const startCode = toDateCode(start);
      const endCode = toDateCode(end);

      const q = query(
        collection(db, "sales"),
        where("date", ">=", startCode),
        where("date", "<=", endCode),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      setSales(data);
      setCount(data.length);

      const total = data.reduce((sum, s) => {
        const amount = parseInt(s.totalAmount?.replace(/,/g, "") || "0");
        return sum + amount;
      }, 0);

      setTotalAmount(total);
    } catch (error) {
      console.error("🔥 매출 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    fetchSales(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <div className="p-6">
      {/* ✅ 상단 제목 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-xl font-bold">매출 관리</h1>
      </div>

      {/* ✅ 날짜 필터 + 총합 */}
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
          <span className="ml-4 text-gray-700 text-sm">
            (매출 건수: {count}건)
          </span>
        </div>
      </div>

      {/* ✅ 매출 내역 테이블 */}
      {sales.length === 0 ? (
        <p className="text-gray-600">해당 기간 내 매출 내역이 없습니다.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-center w-[100px] max-w-[110px]">
                날짜
              </th>
              <th className="border px-3 py-2">품목</th>
              <th className="border px-3 py-2 text-center w-[130px]">
                합계금액
              </th>
              <th className="border px-3 py-2">받는자</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                className="text-center cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/dashboard/sales/${s.id}`)}
              >
                <td className="border px-3 py-2 whitespace-nowrap text-center">
                  {formatDate(s.date)}
                </td>
                <td className="border px-3 py-2 text-left truncate">
                  {s.item || "-"}
                </td>
                <td className="border px-3 py-2 text-right whitespace-nowrap">
                  {parseInt(s.totalAmount?.replace(/,/g, "") || "0").toLocaleString()}원
                </td>
                <td className="border px-3 py-2">{s.customer || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
