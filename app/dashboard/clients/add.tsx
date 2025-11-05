"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();

  // 상태 관리 (input 값)
  const [clientName, setClientName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [bank, setBank] = useState("카카오뱅크");
  const [accountNumber, setAccountNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // 거래은행 목록
  const banks = [
    "카카오뱅크",
    "국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "농협은행",
    "기업은행",
    "카드사",
  ];

  // 전화번호 하이픈 추가
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = e.target.value.replace(/[^0-9]/g, "");
    let formatted = formattedPhone;
    if (formatted.length <= 3) {
      formatted = formatted.substring(0, 3);
    } else if (formatted.length <= 6) {
      formatted = `${formatted.substring(0, 3)}-${formatted.substring(3)}`;
    } else if (formatted.length <= 10) {
      formatted = `${formatted.substring(0, 3)}-${formatted.substring(3, 6)}-${formatted.substring(6)}`;
    } else {
      formatted = `${formatted.substring(0, 3)}-${formatted.substring(3, 6)}-${formatted.substring(6, 10)}`;
    }
    setPhone(formatted);
  };

  // 이메일 하이픈 추가
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 입력한 거래처 저장
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newClient = {
      id: Date.now(), // 고유한 ID 생성 (현재 시간)
      name: clientName,
      representative,
      businessNumber,
      bank,
      accountNumber,
      phone,
      email,
      notes,
    };

    // 기존 거래처 목록 불러오기
    const storedClients = localStorage.getItem("clients");
    let clients = storedClients ? JSON.parse(storedClients) : [];

    // 새 거래처 추가
    clients.push(newClient);

    // 로컬 스토리지에 저장
    localStorage.setItem("clients", JSON.stringify(clients));

    // 거래처 목록 페이지로 돌아가기
    router.push("/dashboard/clients");
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">새 거래처 추가</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 거래처명 */}
        <div>
          <label className="block">거래처명</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 대표자명 */}
        <div>
          <label className="block">대표자명</label>
          <input
            type="text"
            value={representative}
            onChange={(e) => setRepresentative(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 사업자등록번호 */}
        <div>
          <label className="block">사업자등록번호</label>
          <input
            type="text"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 거래은행 */}
        <div>
          <label className="block">거래은행</label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="w-full p-2 border"
          >
            {banks.map((bankOption) => (
              <option key={bankOption} value={bankOption}>
                {bankOption}
              </option>
            ))}
          </select>
        </div>

        {/* 계좌번호 */}
        <div>
          <label className="block">계좌번호</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block">전화번호</label>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block">이메일</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 border"
            required
          />
        </div>

        {/* 비고 */}
        <div>
          <label className="block">비고</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border"
          />
        </div>

        <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl">
          거래처 추가
        </button>
      </form>
    </div>
  );
}
