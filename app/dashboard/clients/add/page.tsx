"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: number;
  name: string;
  representative: string;
  phone: string;
  email: string;
  createdAt: string; // 등록일 추가
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // 정렬순서

  // ✅ 로컬 스토리지에서 거래처 불러오기
  useEffect(() => {
    const storedClients = localStorage.getItem("clients");
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
  }, []);

  // ✅ 거래처 추가 페이지로 이동
  const handleAddClient = () => {
    router.push("/dashboard/clients/add");
  };

  // ✅ 상세 페이지 이동
  const handleViewClient = (id: number) => {
    router.push(`/dashboard/clients/${id}`);
  };

  // ✅ 전화 연결
  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, "");
    window.location.href = `tel:${phoneNumber}`;
  };

  // ✅ 검색 필터 적용
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ 정렬 적용
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name, "ko");
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">거래처 관리</h1>

      {/* 🔍 검색창 */}
      <input
        type="text"
        placeholder="거래처명을 검색하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-md mb-4"
      />

      {/* ↕ 정렬 버튼 */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          {sortOrder === "asc" ? "최근 등록순 보기" : "가나다순 보기"}
        </button>

        {/* ➕ 새 거래처 추가 */}
        <button
          onClick={handleAddClient}
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          새 거래처 추가
        </button>
      </div>

      {/* 📋 거래처 목록 */}
      <ul>
        {sortedClients.length === 0 ? (
          <li>등록된 거래처가 없습니다.</li>
        ) : (
          sortedClients.map((client) => (
            <li
              key={client.id}
              className="border-b py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <span className="font-medium">{client.name}</span>
                <span
                  onDoubleClick={() => handleCall(client.phone)}
                  className="text-blue-600 cursor-pointer"
                >
                  {client.phone}
                </span>
              </div>

              <div className="mt-2 sm:mt-0 flex gap-2">
                <button
                  onClick={() => handleViewClient(client.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md"
                >
                  상세보기
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

