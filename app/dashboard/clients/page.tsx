"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, User } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  account?: string;
  memo?: string;
  createdAt?: string;
  representative?: string; // 대표자명 필드 추가
}

export default function ClientListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("clients");
    if (stored) setClients(JSON.parse(stored));
  }, []);

  const handleAdd = () => {
    router.push("/dashboard/clients/add");
  };

  const handleDetail = (id: string) => {
    router.push(`/dashboard/clients/${id}`);
  };

  const openGmail = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&to=${email}`, "_blank");
  };

  const openNaverMail = (email: string) => {
    window.open(`https://mail.naver.com/write/?to=${email}`, "_blank");
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6">거래처 관리</h2>

      {/* 검색 + 추가 버튼 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="거래처명을 검색하세요"
          className="flex-1 border rounded-md p-2"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
        >
          새 거래처 추가
        </button>
      </div>

      {/* 거래처 카드 리스트 */}
      <div className="space-y-3">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
          >
            {/* 거래처명 */}
            <div
              onClick={() => handleDetail(client.id)}
              className="text-lg font-semibold text-blue-700 hover:underline"
            >
              {client.name}
            </div>

            {/* 대표자명 */}
            {client.representative && (
              <div className="flex items-center text-gray-700 mt-1">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span>{client.representative}</span>
              </div>
            )}

            {/* 전화번호 */}
            {client.phone && (
              <div
                className="flex items-center text-gray-700 mt-1 hover:text-blue-600"
                onClick={() => (window.location.href = `tel:${client.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="underline">{client.phone}</span>
              </div>
            )}

            {/* 이메일 */}
            {client.email && (
              <div className="flex items-center text-gray-700 mt-1 gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{client.email}</span>
                <button
                  onClick={() => openGmail(client.email!)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Gmail
                </button>
                <button
                  onClick={() => openNaverMail(client.email!)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Naver
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            등록된 거래처가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
