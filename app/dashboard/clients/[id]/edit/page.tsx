"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Client = {
  id: number;
  name: string;
  representative: string;
  businessNumber: string;
  bank: string;
  accountNumber: string;
  phone: string;
  email: string;
  note: string;
};

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);

  // ✅ 기존 데이터 로드
  useEffect(() => {
    if (typeof id !== "string") return;
    const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const foundClient = storedClients.find((c: Client) => c.id === Number(id));
    setClient(foundClient || null);
  }, [id]);

  // ✅ 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // ✅ 수정 내용 저장
  const handleSave = () => {
    if (!client) return;

    const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const updated = storedClients.map((c: Client) =>
      c.id === Number(id) ? client : c
    );

    localStorage.setItem("clients", JSON.stringify(updated));
    alert("거래처 정보가 수정되었습니다.");
    router.push(`/dashboard/clients/${id}`);
  };

  if (!client) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg">거래처 정보를 찾을 수 없습니다 😢</h2>
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">거래처 수정</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">거래처명</label>
          <input
            name="name"
            value={client.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">대표자명</label>
          <input
            name="representative"
            value={client.representative}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">사업자등록번호</label>
          <input
            name="businessNumber"
            value={client.businessNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">은행</label>
          <input
            name="bank"
            value={client.bank}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">계좌번호</label>
          <input
            name="accountNumber"
            value={client.accountNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">전화번호</label>
          <input
            name="phone"
            value={client.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">이메일</label>
          <input
            name="email"
            value={client.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">비고</label>
          <textarea
            name="note"
            value={client.note}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push(`/dashboard/clients/${id}`)}
          className="flex-1 bg-gray-400 text-white py-2 rounded"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white py-2 rounded"
        >
          저장
        </button>
      </div>
    </div>
  );
}
