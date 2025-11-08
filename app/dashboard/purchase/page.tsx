"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface Purchase {
  id: string;
  date: string;
  itemName: string;
  total: number;
  supplier: string;
}

export default function PurchasePage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredList, setFilteredList] = useState<Purchase[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState({ count: 0, total: 0 });

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

  // ✅ 날짜 기본값 설정 (종료: 오늘, 시작: 30일 전)
  useEffect(() => {
    const today = new Date();
    const before30 = new Date(today);
    before30.setDate(today.getDate() - 30);

    const format = (d: Date) => d.toISOString().split("T")[0];
    setEndDate(format(today));
    setStartDate(format(before30));
  }, []);

  // ✅ 기간별 필터링 + 합계 계산
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // 종료일 포함

    const filtered = purchases.filter((p) => {
      const date = new Date(p.date);
      return date >= start && date <= end;
    });

    const total = filtered.reduce((sum, p) => sum + (p.total || 0), 0);
    setFilteredList(filtered);
    setSummary({ count: filtered.length, total });
  }, [startDate, endDate, purchases]);

  // ✅ 날짜 포맷 (yy-MM-dd)
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  return (
    <div className="p-6 relative min-h-screen pb-24">
      <h1 className="text-xl font-bold mb-4">매입 관리</h1>

      {/* ✅ 매입 테이블 */}
      <table className="w-full table-fixed border-collapse text-center text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 w-[90px] whitespace-nowrap">날짜</th>
            <th className="border px-3 py-2">품목</th>
            <th className="border px-3 py-2 w-[130px] whitespace-nowrap">합계금액</th>
            <th className="border px-3 py-2">공급자</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length > 0 ? (
            filteredList.map((p) => (
              <tr
                key={p.id}
                onClick={() => router.push(`/dashboard/purchase/${p.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="border px-3 py-2 text-center w-[90px] truncate">
                  {formatDate(p.date)}
                </td>
                <td className="border px-3 py-2">{p.itemName}</td>
                <td className="border px-3 py-2 text-right w-[130px] truncate">
                  {p.total?.toLocaleString()}원
                </td>
                <td className="border px-3 py-2">{p.supplier}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-gray-500">
                해당 기간에 매입 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ 하단 고정 요약바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md py-3 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm sm:text-base z-50">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <span className="font-semibold">~</span>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="text-gray-700 font-semibold flex flex-wrap gap-2 sm:gap-6">
          <span>매입 건수: {summary.count.toLocaleString()}건</span>
          <span>총 매입금액: {summary.total.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
