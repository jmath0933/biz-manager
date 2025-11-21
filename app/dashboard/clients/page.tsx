//dashboard/clients/page.tsx입니다

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Phone, Mail, User, Printer } from "lucide-react";
import { useSwipe } from "@/app/hooks/swipe";

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

  useSwipe({
    onSwipeRight: () => router.push("/dashboard/purchase"),
  });

  return <div className="p-4">거래처 페이지</div>;

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            거래처 관리
          </h1>

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

        {/* 거래처 카드 목록 */}
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-4 sm:p-6"
            >
              {/* 거래처명 + 전화 + 팩스 한 박스 */}
              <div className="bg-blue-50 rounded-md px-4 py-3 text-[15px] text-gray-800 mb-4">
                {/* 거래처명 */}
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-xl sm:text-2xl font-bold text-blue-600 hover:underline block mb-2"
                >
                  {client.name}
                </Link>

                {/* 전화 + 팩스 */}
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {client.telArea && client.telMain && client.telSub && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${client.telArea}${client.telMain}${client.telSub}`}
                        className="hover:text-blue-600"
                      >
                        {client.telArea}-{client.telMain}-{client.telSub}
                      </a>
                    </span>
                  )}

                  {client.faxArea && client.faxMain && client.faxSub && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Printer className="w-4 h-4 text-gray-400" />
                      <span>
                        {client.faxArea}-{client.faxMain}-{client.faxSub}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              {/* 대표자 정보 */}
              <div className="p-4 bg-gray-50 rounded-lg text-[15px] text-gray-800 mb-4">
                {client.representative && (
                  <div className="flex items-center gap-1 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{client.representative}</span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-1 mb-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:text-blue-600 shrink-0">
                      {client.phone}
                    </a>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={`https://mail.naver.com/write?to=${client.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {client.email}
                    </a>
                  </div>
                )}
              </div>

              {/* 담당자 정보 */}
              {client.contacts && client.contacts.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-gray-500 mb-2">담당자</p>
                  <div className="flex flex-col gap-4">
                    {client.contacts.map((contact: Contact, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        {/* 이름 */}
                        <p className="font-medium text-gray-800 mb-2">{contact.name}</p>

                        {/* 전화 + 이메일은 가로 배열 */}
                        <div className="flex gap-x-6 text-[15px] text-gray-800">
                          {contact.phone && (
                            <span className="flex items-center gap-1 flex-none">
                              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="hover:text-blue-600 shrink-0"
                              >
                                {contact.phone}
                              </a>
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1 max-w-[200px]">
                              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                              <a
                                href={`https://mail.naver.com/write?to=${contact.email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 truncate"
                              >
                                {contact.email}
                              </a>
                            </span>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
