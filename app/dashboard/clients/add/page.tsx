// dashboard/clients/add/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ClientForm, { ClientFormData } from "@/components/clients/ClientForm";

export default function AddClientPage() {
  const router = useRouter();

  const handleSubmit = async (payload: ClientFormData) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("거래처 등록 완료!");
      router.push("/dashboard/clients");
    } else {
      alert("등록 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 sm:p-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            새 거래처 등록
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            거래처 정보를 입력하고 저장하세요
          </p>
        </div>

        {/* 폼 */}
        <ClientForm mode="add" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
