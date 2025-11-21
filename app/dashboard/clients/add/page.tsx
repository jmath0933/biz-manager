//dashboard/clients/add/page.tsx입니다

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
    <ClientForm
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
