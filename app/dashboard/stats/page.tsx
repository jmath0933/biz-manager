// app/dashboard/stats/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

const types = ["연간", "반기", "분기", "월별"] as const;
type PeriodType = typeof types[number];

const periods: Record<PeriodType, string[]> = {
  연간: ["전체"],
  반기: ["1기", "2기"],
  분기: ["1사분기", "2사분기", "3사분기", "4사분기"],
  월별: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
};

interface Purchase {
  id: string;
  date: string;
  year: number;
  month: number;
  item: string;
  supplier: string;
  amount: number;
}

interface Sale {
  id: string;
  date: string;
  year: number;
  month: number;
  item: string;
  buyer: string;
  amount: number;
}

interface DailyStats {
  id: string;
  date: string;
  sales: number;
  purchase: number;
  type: "sale" | "purchase";
}

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function SalesStatsDashboard() {
  const router = useRouter();
  const currentDate = getCurrentYearMonth();

  const allYears = Array.from(
    { length: currentDate.year - 2022 + 1 },
    (_, i) => 2022 + i
  );

  const [yearsState] = useState<number[]>(allYears);
  const [year, setYear] = useState<number>(currentDate.year);
  const [type, setType] = useState<PeriodType>("월별");
  const [period, setPeriod] = useState<string>(`${currentDate.month}월`);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) throw new Error("데이터 불러오기 실패");

        const { purchases, sales }: { purchases: Purchase[]; sales: Sale[] } =
          await response.json();

        const filteredSales = sales.filter(
          (item) => item.year === year && matchesPeriod(item.month, type, period)
        );
        const filteredPurchases = purchases.filter(
          (item) => item.year === year && matchesPeriod(item.month, type, period)
        );

        // ✅ 합산하지 않고 모두 표현
        const statsArray: DailyStats[] = [
          ...filteredSales.map((sale) => ({
            id: sale.id,
            date: sale.date,
            sales: sale.amount,
            purchase: 0,
            type: "sale" as const,
          })),
          ...filteredPurchases.map((purchase) => ({
            id: purchase.id,
            date: purchase.date,
            sales: 0,
            purchase: purchase.amount,
            type: "purchase" as const,
          })),
        ].sort((a, b) => a.date.localeCompare(b.date));

        setDailyStats(statsArray);
      } catch (error) {
        setError(error instanceof Error ? error.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, type, period]);

  function matchesPeriod(month: number, type: PeriodType, period: string) {
    if (type === "연간") return true;
    if (type === "반기") {
      if (period === "1기") return month >= 1 && month <= 6;
      if (period === "2기") return month >= 7 && month <= 12;
    }
    if (type === "분기") {
      if (period === "1사분기") return month >= 1 && month <= 3;
      if (period === "2사분기") return month >= 4 && month <= 6;
      if (period === "3사분기") return month >= 7 && month <= 9;
      if (period === "4사분기") return month >= 10 && month <= 12;
    }
    if (type === "월별") {
      const targetMonth = parseInt(period.replace("월", ""));
      return month === targetMonth;
    }
    return false;
  }

  const totalSales = dailyStats.reduce((acc, stat) => acc + stat.sales, 0);
  const totalPurchase = dailyStats.reduce((acc, stat) => acc + stat.purchase, 0);
  const netProfit = totalSales - totalPurchase;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">매출 합계</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {totalSales.toLocaleString()}원
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">매입 합계</p>
              <ShoppingCart className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {totalPurchase.toLocaleString()}원
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">총이익</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p
              className={`text-2xl font-bold ${
                netProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {netProfit.toLocaleString()}원
            </p>
          </div>
        </div>
                {/* 통계 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-600 font-semibold mb-2">오류 발생</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                새로고침
              </button>
            </div>
          ) : dailyStats.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              선택한 기간에 데이터가 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-3 py-3 w-28 text-center text-sm font-semibold text-gray-700">
                      날짜
                    </th>
                    <th className="px-6 py-3 w-40 text-center text-sm font-semibold text-gray-700">
                      매출
                    </th>
                    <th className="px-6 py-3 w-40 text-center text-sm font-semibold text-gray-700">
                      매입
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {/* 날짜 */}
                      <td className="px-3 py-4 text-sm text-gray-800">
                        {stat.date}
                      </td>

                      {/* 매출 셀: 클릭 시 sales 상세 페이지 이동 */}
                      <td
                        className="px-6 py-4 text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() =>
                          stat.type === "sale" &&
                          router.push(`/dashboard/sales/${stat.id}`)
                        }
                      >
                        {stat.sales !== 0 && Number.isFinite(stat.sales) ? stat.sales.toLocaleString() + "원" : ""}
                      </td>

                      {/* 매입 셀: 클릭 시 purchase 상세 페이지 이동 */}
                      <td
                        className="px-6 py-4 text-sm text-right text-red-600 font-medium cursor-pointer hover:underline"
                        onClick={() =>
                          stat.type === "purchase" &&
                          router.push(`/dashboard/purchase/${stat.id}`)
                        }
                      >
                        {stat.purchase !== 0 && Number.isFinite(stat.purchase) ? stat.purchase.toLocaleString() + "원" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-3 py-4 text-sm font-bold text-gray-800">
                      총합계
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-blue-600">
                      {totalSales.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      {totalPurchase.toLocaleString()}원
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-4 text-sm font-bold text-gray-800">
                      총이익
                    </td>
                    <td
                      colSpan={2}
                      className={`px-6 py-4 text-sm text-right font-bold ${
                        netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {netProfit.toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
