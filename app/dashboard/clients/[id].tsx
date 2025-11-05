"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // `useParams` 사용

type Client = {
  id: number;
  name: string;
  representative: string;
  phone: string;
  email: string;
};

export default function ClientDetailPage() {
  const { id } = useParams();  // useParams로 id 값을 받아옴
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (id) {
      const storedClients = localStorage.getItem("clients");
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const client = clients.find((client: Client) => client.id === Number(id));
        setClient(client || null);  // 해당 거래처 찾기
      }
    }
  }, [id]);

  if (!client) {
    return <div>거래처 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">거래처 상세 정보</h1>
      <div className="mb-4">
        <strong>거래처명:</strong> {client.name}
      </div>
      <div className="mb-4">
        <strong>대표자명:</strong> {client.representative}
      </div>
      <div className="mb-4">
        <strong>전화번호:</strong> {client.phone}
      </div>
      <div className="mb-4">
        <strong>이메일:</strong> {client.email}
      </div>
    </div>
  );
}
