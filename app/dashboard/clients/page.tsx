//dashboard/clients/page.tsx입니다

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Phone, Mail, User } from "lucide-react";

interface Contact {
  name: string;
  phone: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
  representative: string;
  businessNumber: string;
  telArea: string;
  telMain: string;
  telSub: string;
  faxArea: string;
  faxMain: string;
  faxSub: string;
  phone: string;
  email: string;
  address: string;
  bank: string;
  accountNumber: string;
  contacts: Contact[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("목록 불러오기 오류:", err);
        setLoading(false);
      });
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.representative?.toLowerCase().includes(search.toLowerCase()) ||
      c.businessNumber?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">거래처 관리</h1>
          
          {/* 검색 + 추가 버튼 */}
<div className="flex items-center gap-3 w-full">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="거래처명, 대표자, 사업자번호로 검색"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
  <button
    onClick={() => router.push("/dashboard/clients/add")}
    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm whitespace-nowrap"
  >
    <Plus className="w-5 h-5" />
    새 거래처 추가
  </button>
</div>
        </div>

        {/* 거래처 카드 목록 (모바일 친화적) */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">등록된 거래처가 없습니다</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* 왼쪽: 기본 정보 */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-lg sm:text-xl font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {client.name}
                      </Link>
                      {client.businessNumber && (
                        <p className="text-sm text-gray-500 mt-1">
                          사업자: {client.businessNumber}
                        </p>
                      )}
                    </div>

                    {/* 대표자 정보 */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {client.representative && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{client.representative}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                            {client.phone}
                          </a>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                            {client.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* 회사 연락처 */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {client.telArea && client.telMain && client.telSub && (
                        <div>
                          <span className="font-medium">전화:</span>{" "}
                          {client.telArea}-{client.telMain}-{client.telSub}
                        </div>
                      )}
                      {client.faxArea && client.faxMain && client.faxSub && (
                        <div>
                          <span className="font-medium">팩스:</span>{" "}
                          {client.faxArea}-{client.faxMain}-{client.faxSub}
                        </div>
                      )}
                    </div>

                    {/* 담당자 정보 */}
                    {client.contacts && client.contacts.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-2">담당자</p>
                        <div className="flex flex-wrap gap-3">
                          {client.contacts.map((contact, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 px-3 py-1 rounded-full"
                            >
                              <span className="font-medium">{contact.name}</span>
                              {contact.phone && (
                                <span className="text-gray-500 ml-2">{contact.phone}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 액션 버튼 */}
                  <div className="flex sm:flex-col gap-2">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="flex-1 sm:flex-none text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      상세보기
                    </Link>
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className="flex-1 sm:flex-none text-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      수정
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 결과 카운트 */}
        {filteredClients.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            총 {filteredClients.length}개의 거래처
          </div>
        )}
      </div>
    </div>
  );
}