"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  account?: string;
  memo?: string;
  createdAt?: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const stored = localStorage.getItem("clients");
    if (stored && id) {
      const clients: Client[] = JSON.parse(stored);
      const found = clients.find((c) => String(c.id) === String(id));
      if (found) setClient(found);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) return <div className="text-center mt-10">로딩 중...</div>;
  if (!client)
    return <div className="text-center text-red-500 mt-10">해당 거래처를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">거래처 상세정보</h2>

      <div className="flex flex-col gap-4 text-gray-700">
        <div><span className="text-sm text-gray-500">거래처명</span><div className="font-medium text-lg">{client.name}</div></div>
        <div><span className="text-sm text-gray-500">전화번호</span><div>{client.phone || "-"}</div></div>
        <div><span className="text-sm text-gray-500">이메일</span><div>{client.email || "-"}</div></div>
        <div><span className="text-sm text-gray-500">주소</span><div>{client.address || "-"}</div></div>
        <div><span className="text-sm text-gray-500">계좌번호</span><div>{client.account || "-"}</div></div>
        <div><span className="text-sm text-gray-500">메모</span><div className="whitespace-pre-wrap border rounded-md p-2 bg-gray-50">{client.memo || "-"}</div></div>
        {client.createdAt && (
          <div className="text-right text-xs text-gray-400">
            등록일: {new Date(client.createdAt).toLocaleDateString("ko-KR")}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          목록으로
        </button>
        <button
          onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}
