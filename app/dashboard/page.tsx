"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

export default function DashboardPage() {
  // ===============================
  // 🔹 데모용 기본 데이터 (Firestore 연결 가능)
  // ===============================
  const summary = {
    sales: 12800000,
    purchase: 8300000,
    profit: 4500000,
    invoices: 18,
  };

  const recent = [
    { id: 1, date: "2025-02-10", item: "전자부품 A", amount: 2500000 },
    { id: 2, date: "2025-02-09", item: "전자부품 B", amount: 1800000 },
    { id: 3, date: "2025-02-08", item: "소모품", amount: 320000 },
    { id: 4, date: "2025-02-07", item: "외주 가공", amount: 900000 },
    { id: 5, date: "2025-02-07", item: "포장재", amount: 120000 },
  ];

  const chartData = [
    { name: "1월", sales: 900, purchase: 500 },
    { name: "2월", sales: 1100, purchase: 700 },
    { name: "3월", sales: 800, purchase: 600 },
    { name: "4월", sales: 1300, purchase: 900 },
    { name: "5월", sales: 1150, purchase: 780 },
  ];

  const [todos, setTodos] = useState([
    "세금계산서 발행",
    "거래처 장부 업데이트",
    "재고 확인",
  ]);

  // ===============================

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">📊 비즈 매니저 대시보드</h1>

      {/* =============================
          1줄 — 이번 달 요약 카드 4개
      ============================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard title="이번 달 매출" value={summary.sales} color="bg-blue-500" />
        <SummaryCard title="이번 달 매입" value={summary.purchase} color="bg-green-500" />
        <SummaryCard title="이번 달 이익" value={summary.profit} color="bg-yellow-500" />
        <SummaryCard title="발행 세금계산서" value={summary.invoices} color="bg-purple-500" />
      </div>

      {/* =============================
          2줄 — 달력 + 오늘의 할 일
      ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* 달력 — 간단 Calendar */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">📅 달력</h2>
          <Calendar />
        </div>

        {/* 오늘의 할 일 */}
        <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">📝 오늘의 할 일</h2>

          <ul className="space-y-3">
            {todos.map((t, i) => (
              <li
                key={i}
                className="p-3 border rounded-lg bg-gray-50 text-gray-800"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* =============================
          3줄 — 최근 거래 + 간단 차트
      ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 거래 */}
        <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">📄 최근 거래 5건</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">날짜</th>
                <th className="py-2 text-left">항목</th>
                <th className="py-2 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">{row.item}</td>
                  <td className="py-2 text-right">{row.amount.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 간단 차트 — 매출/매입 추세 */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">📈 매출·매입 추세</h2>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="purchase" stroke="#10b981" fill="#6ee7b7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   요약 카드 컴포넌트
================================ */
function SummaryCard({ title, value, color }: any) {
  return (
    <div className={`p-6 rounded-xl shadow text-white ${color}`}>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-2xl font-bold mt-2">{value.toLocaleString()}원</p>
    </div>
  );
}

/* ===============================
   간단 달력 컴포넌트
================================ */
const Calendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 해당 월의 1일, 마지막 날짜
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days = [];

  // 앞 공백
  for (let i = 0; i < firstDay; i++) days.push(null);

  // 날짜 채우기
  for (let d = 1; d <= lastDate; d++) days.push(d);

  return (
    <div>
      <div className="text-center font-semibold text-lg mb-4">
        {year}년 {month + 1}월
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="font-bold py-2">
            {d}
          </div>
        ))}

        {days.map((d, i) => (
          <div key={i} className="py-2 h-10 flex items-center justify-center">
            {d ? (
              <span
                className={`${
                  d === today.getDate() ? "bg-blue-500 text-white px-2 rounded" : ""
                }`}
              >
                {d}
              </span>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
