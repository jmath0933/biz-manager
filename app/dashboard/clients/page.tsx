"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, User, Building2, Loader2, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  representative?: string;
  phone: string;
  email?: string;
  address?: string;
  bank?: string;
  accountNumber?: string;
  businessNumber?: string;
  memo?: string;
  createdAt?: string;
}

export default function ClientListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      console.log("🔍 거래처 목록 불러오기 시작...");
      setLoading(true);
      setError(null);
      
      try {
        console.log("📡 API 호출: /api/clients");
        const res = await fetch("/api/clients");
        
        console.log("📥 응답 상태:", res.status, res.statusText);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ 받은 데이터:", data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // createdAt 포맷팅
        const formattedClients = (data.clients || []).map((client: Client) => ({
          ...client,
          createdAt: client.createdAt 
            ? new Date(client.createdAt).toLocaleString("ko-KR")
            : "-",
        }));
        
        setClients(formattedClients);
        console.log(`✅ ${formattedClients.length}개의 거래처 로드 완료`);
      } catch (err: any) {
        console.error("❌ 거래처 목록 불러오기 실패:", err);
        setError(err.message || "거래처 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAdd = () => router.push("/dashboard/clients/add");
  const handleDetail = (id: string) => router.push(`/dashboard/clients/${id}`);
  const handleCall = (phone: string) => phone && (window.location.href = `tel:${phone}`);
  const handleEmail = (email: string) => {
    if (!email) return;
    const link = email.includes("@naver.com")
      ? "https://mail.naver.com"
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    window.open(link, "_blank");
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.representative ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">거래처 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="font-semibold text-red-600 mb-2">오류가 발생했습니다</p>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          거래처 관리
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({clients.length}개)
          </span>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="거래처명 또는 대표자 검색"
            className="flex-1 border rounded-md p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="whitespace-nowrap bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base transition"
          >
            새 거래처 추가
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => handleDetail(client.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-lg text-gray-800 hover:underline">
                {client.name}
              </span>
            </div>

            {client.representative && (
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <span>{client.representative}</span>
              </div>
            )}

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleCall(client.phone);
              }}
              className="flex items-center gap-2 text-blue-600 text-sm sm:text-base mb-1 hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span>{client.phone || "-"}</span>
            </div>

            {client.email && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmail(client.email!);
                }}
                className="flex items-center gap-2 text-green-600 text-sm sm:text-base hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
            )}

            {(client.bank || client.accountNumber) && (
              <div className="text-gray-600 text-sm sm:text-base">
                💳 {client.bank} {client.accountNumber}
              </div>
            )}

            {client.businessNumber && (
              <div className="text-gray-600 text-sm">
                사업자번호: {client.businessNumber}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-1">
              등록일: {client.createdAt}
            </div>
          </div>
        ))}

        {filtered.length === 0 && clients.length > 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              다른 검색어를 입력해보세요.
            </p>
          </div>
        )}

        {clients.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">등록된 거래처가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              새 거래처 추가 버튼을 눌러 시작하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}