//dashboard/clients/[id]/edit/page.tsx입니다

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClientForm, { ClientFormData } from "@/components/clients/ClientForm";

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<ClientFormData> | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((res) => res.json())
      .then((data) => setInitialData(data))
      .catch((err) => console.error("수정 데이터 로딩 오류:", err));
  }, [id]);

  const handleSubmit = async (payload: ClientFormData) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("거래처 수정 완료!");
      router.push(`/dashboard/clients/${id}`);
    } else {
      alert("수정 실패");
    }
  };

  // ✅ 데이터가 없으면 로딩 중 표시
  if (!initialData) {
    return <div className="p-6">거래처 정보를 불러오는 중입니다...</div>;
  }

  // ✅ 데이터가 준비된 후에만 ClientForm 렌더링
  return (
    <ClientForm
      mode="edit"
      clientId={id as string}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
