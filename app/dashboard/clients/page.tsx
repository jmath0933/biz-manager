"use client";

import { useState } from "react";

export default function ClientsPage() {
  const [client, setClient] = useState({
    name: "",
    ceo: "",
    bizNumber: "",
    bank: "",
    account: "",
    phone: "",
    email: "",
    note: "",
  });

  // 국내 은행 리스트
  const banks = [
    "국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "기업은행",
    "농협은행",
    "SC제일은행",
    "부산은행",
    "대구은행",
    "광주은행",
    "전북은행",
    "경남은행",
    "수협은행",
    "카카오뱅크",
    "토스뱅크",
    "케이뱅크",
  ];

  // 하이픈 자동 입력 함수
  const formatBizNumber = (value: string) => {
    return value
      .replace(/[^0-9]/g, "")
      .replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3")
      .substring(0, 12);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/[^0-9]/g, "")
      .replace(/(^02|^0\d{2})(\d+)?(\d{4})$/, "$1-$2-$3")
      .replace("--", "-");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "bizNumber") formatted = formatBizNumber(value);
    if (name === "phone") formatted = formatPhone(value);

    setClient({ ...client, [name]: formatted });
  };

  // Gmail 또는 Naver로 메일 보내기
  const sendMail = () => {
    if (!client.email) return alert("이메일을 입력하세요!");
    const email = client.email;
    const subject = encodeURIComponent("거래 관련 문의");
    const body = encodeURIComponent("안녕하세요, 거래 관련 문의드립니다.");
    const isNaver = email.includes("naver.com");
    const url = isNaver
      ? `https://mail.naver.com/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    window.open(url, "_blank");
  };

  // 전화 걸기
  const callNumber = () => {
    if (!client.phone) return alert("전화번호를 입력하세요!");
    window.location.href = `tel:${client.phone.replace(/-/g, "")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">📇 거래처 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-lg">
        <div>
          <label className="block text-sm font-medium mb-1">거래처명</label>
          <input
            type="text"
            name="name"
            value={client.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">대표자명</label>
          <input
            type="text"
            name="ceo"
            value={client.ceo}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">사업자등록번호</label>
          <input
            type="text"
            name="bizNumber"
            value={client.bizNumber}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="000-00-00000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">거래은행</label>
          <select
            name="bank"
            value={client.bank}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 bg-white"
          >
            <option value="">은행 선택</option>
            {banks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">계좌번호</label>
          <input
            type="text"
            name="account"
            value={client.account}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">전화번호</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="phone"
              value={client.phone}
              onChange={handleChange}
              className="flex-1 border rounded-lg p-2"
              placeholder="010-0000-0000"
            />
            <button
              onClick={callNumber}
              className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600"
            >
              통화
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              value={client.email}
              onChange={handleChange}
              className="flex-1 border rounded-lg p-2"
              placeholder="example@gmail.com"
            />
            <button
              onClick={sendMail}
              className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600"
            >
              메일쓰기
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">비고</label>
          <textarea
            name="note"
            value={client.note}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
