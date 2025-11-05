"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");

  // 거래처 추가 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = { name: clientName };
    // 로컬 스토리지나 상태에 추가 로직
    router.push("/dashboard/clients"); // 추가 후 목록 페이지로 돌아감
  };

  return (
    <div className="p-5">
      <h1>새 거래처 추가</h1>
      <form onSubmit={handleSubmit}>
        <label>거래처명</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <button type="submit">저장</button>
      </form>
    </div>
  );
}
