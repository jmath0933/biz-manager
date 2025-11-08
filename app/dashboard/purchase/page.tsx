"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Purchase {
  id: string;
  date: string;
  itemName: string;
  total: number;
  supplier: string;
}

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtered, setFiltered] = useState({ count: 0, total: 0 });

  // ✅ Firestore 데이터 불러오기
  useEffect(() => {
    const fetchPurchases = async () => {
      const snapshot = await getDocs(collection(db, "purchases"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Purchase, "id">),
      }));
      setPurchases(data);
    };
    fetchPurchases();
  }, []);

  // ✅ 날짜 기본값 설정 (오늘)
  useEffect(() => {
    const today = new Date();
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // ✅ 기간별 필터링
  useEffect(() => {
    if (!startDate || !endDate) {
      setFiltered({ count: 0, total: 0 });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // 종료일 포함

    const filteredData = purchases.filter((p) => {
      const date = new Date(p.date);
      return date >= start && date <= end;
    });

    const total = filteredData.reduce((sum, p) => sum + (p.total || 0), 0);
    setFiltered({ count: filteredData.length, total });
  }, [startDate, endDate, purchases]);

  return (
    <div className="p-6 relative min-h-screen pb-24">
      <h1 className="text-xl font-bold mb-4">매입 관리</h1>

      {/* 매입 테이블 */}
      <table className="min-w-full border-collapse border text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">날짜</th>
            <th className="border px-3 py-2">품목</th>
            <th className="border px-3 py-2">합계금액</th>
            <th className="border px-3 py-2">공급자</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td className="border px-3 py-2">
                {new Date(p.date).toLocaleDateString("ko-KR")}
              </td>
              <td className="border px-3 py-2">{p.itemName}</td>
              <td className="border px-3 py-2">
                {p.total?.toLocaleString()}원
              </td>
              <td className="border px-3 py-2">{p.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 하단 고정 요약바 (시작~종료 날짜 선택 포함) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md py-3 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm sm:text-base z-50">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <label htmlFor="startDate" className="font-semibold whitespace-nowrap">
            시작 날짜:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />

          <span className="font-semibold">~</span>

          <label htmlFor="endDate" className="font-semibold whitespace-nowrap">
            종료 날짜:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="text-gray-700 font-semibold flex flex-wrap gap-2 sm:gap-6">
          <span>
            기간:{" "}
            {startDate
              ? new Date(startDate).toLocaleDateString("ko-KR")
              : "----.--.--"}{" "}
            ~{" "}
            {endDate
              ? new Date(endDate).toLocaleDateString("ko-KR")
              : "----.--.--"}
          </span>
          <span>매입 건수: {filtered.count.toLocaleString()}건</span>
          <span>총 매입금액: {filtered.total.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
