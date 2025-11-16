"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  Package, 
  DollarSign, 
  Receipt, 
  ExternalLink,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";

interface PurchaseDetail {
  id: string;
  date: number;
  supplier: string;
  supplierBiz?: string;
  item: string;
  supplyValue: number;
  tax: number;
  totalAmount: number;
  fileUrl?: string;
  filePath?: string;
}

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 돌아갈 URL (쿼리 파라미터 유지)
  const getBackUrl = () => {
    if (typeof window === 'undefined') return '/dashboard/purchase';
    
    // 이전 페이지의 쿼리 파라미터를 가져오기
    const referrer = document.referrer;
    if (referrer.includes('/dashboard/purchase')) {
      try {
        const url = new URL(referrer);
        const searchParams = url.searchParams.toString();
        return searchParams ? `/dashboard/purchase?${searchParams}` : '/dashboard/purchase';
      } catch {
        return '/dashboard/purchase';
      }
    }
    
    return '/dashboard/purchase';
  };

  const handleBack = () => {
    router.push(getBackUrl());
  };

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("📡 매입 상세 조회:", id);
        const res = await fetch(`/api/purchases/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📄 받은 데이터:", data);
        
        setPurchase(data);
      } catch (err: any) {
        console.error("❌ 매입 상세보기 오류:", err);
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchase();
    }
  }, [id]);

  // 날짜 포맷팅: 251007 → "2025년 10월 07일"
  const formatDate = (dateNum: number): string => {
    const str = dateNum.toString().padStart(6, "0");
    const yy = str.slice(0, 2);
    const mm = str.slice(2, 4);
    const dd = str.slice(4, 6);
    return `20${yy}년 ${mm}월 ${dd}일`;
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!purchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">데이터를 찾을 수 없습니다.</p>
          <button
            onClick={handleBack}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 음수 여부 확인 (수정 세금계산서)
  const isNegative = purchase.totalAmount < 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">목록으로</span>
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              매입 상세정보
            </h1>
            {isNegative && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                수정 계산서
              </span>
            )}
          </div>
        </div>

        {/* 상세 정보 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 날짜 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {formatDate(purchase.date)}
              </span>
            </div>
          </div>

          {/* 정보 리스트 */}
          <div className="divide-y divide-gray-200">
            {/* 공급자 */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">공급자</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {purchase.supplier || "-"}
                  </p>
                  {purchase.supplierBiz && (
                    <p className="text-sm text-gray-500 mt-1">
                      사업자번호: {purchase.supplierBiz}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 품목 */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">품목</p>
                  <p className="text-lg font-semibold text-gray-800 break-words">
                    {purchase.item || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-3">금액 정보</p>
                  
                  <div className="space-y-3">
                    {/* 공급가액 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">공급가액</span>
                      <span className={`text-lg font-semibold ${
                        purchase.supplyValue < 0 ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {purchase.supplyValue < 0 && '▲ '}
                        {Math.abs(purchase.supplyValue || 0).toLocaleString()}원
                      </span>
                    </div>

                    {/* 세액 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">세액 (10%)</span>
                      <span className={`text-lg font-semibold ${
                        purchase.tax < 0 ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {purchase.tax < 0 && '▲ '}
                        {Math.abs(purchase.tax || 0).toLocaleString()}원
                      </span>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-semibold">합계금액</span>
                        <span className={`text-xl sm:text-2xl font-bold ${
                          purchase.totalAmount < 0 ? 'text-red-600' : 'text-blue-700'
                        }`}>
                          {purchase.totalAmount < 0 && '▲ '}
                          {Math.abs(purchase.totalAmount || 0).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 원본 문서 */}
            {purchase.fileUrl && (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-3">원본 세금계산서</p>
                    <a
                      href={purchase.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">원본 보기</span>
                    </a>
                    {purchase.filePath && (
                      <p className="text-xs text-gray-400 mt-2 break-all">
                        {purchase.filePath}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              국세청에서 발급된 세금계산서는 수정 및 삭제가 불가능합니다.
              {isNegative && " 이 문서는 수정(취소) 세금계산서입니다."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}