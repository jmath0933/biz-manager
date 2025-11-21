"use client";

import { useState, useEffect } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { useSwipe } from "@/app/hooks/swipe";
import { format } from "date-fns";
import { Calendar, ShoppingCart, FileText, Package } from "lucide-react";

interface Purchase {
  id: string;
  date: number; // YYMMDD 숫자 형식
  item: string;
  totalAmount: number;
  supplier: string;
  supplyValue?: number;
  tax?: number;
  fileUrl?: string; // fileUrl 필드 추가
}

// 날짜 변환 헬퍼
const formatDate = (dateNum: number): string => {
  const str = dateNum.toString().padStart(6, "0");
  return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
};

// 기본 날짜: 최근 30일
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
  const searchParams = useSearchParams();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // URL에서 날짜 파라미터 읽기
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(
    searchParams.get('start') || defaultDates.startDate
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('end') || defaultDates.endDate
  );
  
  useSwipe({
    onSwipeLeft: () => router.push("/dashboard/clients"),
    onSwipeRight: () => router.push("/dashboard/sales"),
  });

  // URL 파라미터가 변경되면 state 업데이트
  useEffect(() => {
    const urlStart = searchParams.get('start');
    const urlEnd = searchParams.get('end');
    
    if (urlStart) setStartDate(urlStart);
    if (urlEnd) setEndDate(urlEnd);
  }, [searchParams]);

  // 날짜가 변경되면 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('start', startDate);
    params.set('end', endDate);
    
    const newUrl = `/dashboard/purchase?${params.toString()}`;
    
    // 현재 URL과 다를 때만 업데이트
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [startDate, endDate, router]);

  // 서버 API 호출
  const fetchPurchases = async (start: string, end: string) => {
    setLoading(true);
    try {
      const url = `/api/purchases?start=${start}&end=${end}`;
      console.log("🌐 API 호출:", url);
      
      const res = await fetch(url);
      console.log("📡 응답 상태:", res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("📦 받은 데이터:", data);
      
      // fileUrl이 있는 데이터만 필터링
      const validPurchases = (data.purchases || data || []).filter(
        (p: Purchase) => p.fileUrl && p.fileUrl.trim() !== ""
      );
      
      console.log("📊 조회된 매입 데이터:", validPurchases.length, "건");
      setPurchases(validPurchases);
    } catch (error) {
      console.error("❌ 매입 데이터 조회 오류:", error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases(startDate, endDate);
  }, [startDate, endDate]);

  // 총합 계산
  const totalAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const count = purchases.length;

  // 월별 그룹화
  const groupedByMonth = purchases.reduce((acc, p) => {
    const dateStr = formatDate(p.date); // "YY-MM-DD"
    const [yy, mm, dd] = dateStr.split("-");
    const key = `${yy}-${mm}`;
    
    if (!acc[key]) {
      acc[key] = {
        year: `20${yy}`,
        month: mm,
        items: [],
        total: 0,
      };
    }
    
    acc[key].items.push({
      ...p,
      day: dd, // 일(day)만 추출
      formattedDate: dateStr,
    });
    acc[key].total += p.totalAmount || 0;
    
    return acc;
  }, {} as Record<string, {
    year: string;
    month: string;
    items: (Purchase & { day: string; formattedDate: string })[];
    total: number;
  }>);

  console.log("📅 월별 그룹화:", groupedByMonth);

  // 월 정렬 (최신순)
  const sortedMonths = Object.entries(groupedByMonth).sort(([a], [b]) => 
    b.localeCompare(a)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            매입 관리
          </h1>
        </div>

        {/* 날짜 필터 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* 날짜 선택 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-5 h-5 text-gray-500 hidden sm:block" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500 font-medium">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 총합 표시 (모바일: 세로, 데스크톱: 가로) */}
            <div className="sm:ml-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">총 매입금액</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-700">
                    {totalAmount.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">원</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 sm:border-l sm:border-gray-300 sm:pl-3">
                  <FileText className="w-4 h-4" />
                  <span>매입 건수: <strong className="text-gray-800">{count}</strong>건</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-3 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && purchases.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">해당 기간 내 매입 내역이 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">다른 기간을 선택해보세요</p>
          </div>
        )}

        {/* 매입 내역 */}
        {!loading && purchases.length > 0 && (
          <div className="space-y-6">
            {sortedMonths.map(([key, data]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* 월별 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {data.year}년 {data.month}월
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-blue-50">
                      <span>총합: <strong className="text-white text-base">{data.total.toLocaleString()}원</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>{data.items.length}건</span>
                    </div>
                  </div>
                </div>

                {/* 데스크톱: 테이블 */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                          날짜
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          품목
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                          합계금액
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                          공급자
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.items.map((p, idx) => {
                        console.log(`항목 ${idx}:`, { date: p.date, day: p.day, formattedDate: p.formattedDate });
                        return (
                          <tr
                            key={p.id}
                            onClick={() => router.push(`/dashboard/purchase/${p.id}`)}
                            className="hover:bg-blue-50 cursor-pointer transition"
                          >
                            <td className="px-4 py-3 text-center text-gray-700 font-medium">
                              {p.day}일
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              <div className="truncate max-w-md" title={p.item}>
                                {p.item || "-"}
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold ${
                              (p.totalAmount || 0) < 0 ? 'text-red-600' : 'text-gray-800'
                            }`}>
                              {(p.totalAmount || 0) < 0 && '▲ '}
                              {Math.abs(p.totalAmount || 0).toLocaleString()}원
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {p.supplier || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 모바일: 카드 리스트 */}
                <div className="sm:hidden divide-y divide-gray-200">
                  {data.items.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/dashboard/purchase/${p.id}`)}
                      className="p-4 active:bg-blue-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                            {p.day}
                          </span>
                          <span className="text-xs text-gray-500">{p.formattedDate}</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          (p.totalAmount || 0) < 0 ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {(p.totalAmount || 0) < 0 && '▲ '}
                          {Math.abs(p.totalAmount || 0).toLocaleString()}원
                        </span>
                      </div>
                      <div className="mb-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {p.item || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Package className="w-3 h-3" />
                        <span>{p.supplier || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}