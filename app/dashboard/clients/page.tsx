"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: number;
  name: string;
  representative: string;
  phone: string;
  email: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);

  // 컴포넌트가 마운트될 때 로컬 스토리지에서 거래처 목록을 불러옴
  useEffect(() => {
    const storedClients = localStorage.getItem("clients");
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
  }, []);

  // 거래처 추가 페이지로 이동
  const handleAddClient = () => {
    router.push("/dashboard/clients/add");
  };

  // 거래처 상세 페이지로 이동
  const handleViewClient = (id: number) => {
    router.push(`/dashboard/clients/${id}`);
  };

  // 전화 연결
  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, ''); // 숫자만 추출
    window.location.href = `tel:${phoneNumber}`; // 전화 걸기
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">거래처 관리</h1>

      {/* 거래처 추가 버튼 - 페이지 상단에 하나만 배치 */}
      <button
        onClick={handleAddClient}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl mb-4"
      >
        새 거래처 추가
      </button>

      {/* 거래처 목록 */}
      <ul>
        {clients.length === 0 ? (
          <li>등록된 거래처가 없습니다.</li>
        ) : (
          clients.map((client) => (
            <li key={client.id} className="border-b py-3">
              <div className="flex justify-between">
                <span>{client.name}</span> {/* 거래처명 */}
                <span
                  onDoubleClick={() => handleCall(client.phone)} // 전화번호 두 번 클릭 시 전화 연결
                  className="text-blue-600 cursor-pointer"
                >
                  {client.phone}
                </span>
              </div>

              {/* 상세보기 버튼 */}
              <button
                onClick={() => handleViewClient(client.id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md mr-2"
              >
                상세보기
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
