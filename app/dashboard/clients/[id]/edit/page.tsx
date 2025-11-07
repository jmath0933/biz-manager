"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditClientPage() {
  const router = useRouter();
  const { id } = useParams();

  const [client, setClient] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    representative: "",
    businessNumber: "",
    phone: "",
    email: "",
    bank: "",
    accountNumber: "",
    address: "",
    memo: "",
  });

  const banks = [
    "국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "농협은행",
    "기업은행",
    "카카오뱅크",
    "토스뱅크",
  ];

  // ✅ 은행별 계좌번호 하이픈 규칙
  const formatAccountNumberByBank = (bank: string, value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    switch (bank) {
      case "국민은행":
        return digits.replace(/^(\d{6})(\d{2})(\d{0,6}).*/, "$1-$2-$3");
      case "신한은행":
        return digits.replace(/^(\d{3})(\d{3})(\d{0,6}).*/, "$1-$2-$3");
      case "우리은행":
      case "기업은행":
      case "하나은행":
        return digits.replace(/^(\d{3})(\d{6})(\d{0,5}).*/, "$1-$2-$3");
      case "농협은행":
        return digits.replace(/^(\d{3})(\d{2})(\d{0,6}).*/, "$1-$2-$3");
      case "카카오뱅크":
        return digits.replace(/^(\d{4})(\d{2})(\d{0,7}).*/, "$1-$2-$3");
      case "토스뱅크":
        return digits.replace(/^(\d{4})(\d{2})(\d{0,6}).*/, "$1-$2-$3");
      default:
        return digits;
    }
  };

  // ✅ 데이터 불러오기
  useEffect(() => {
  if (!id) return;

  const stored = localStorage.getItem("clients");
  if (!stored) return;

  const clients = JSON.parse(stored);

  // ✅ id 타입을 문자열로 맞춰줌
  const found = clients.find((c: any) => String(c.id) === String(id));

  if (found) setClient(found);
  else alert("해당 거래처 정보를 찾을 수 없습니다.");

}, [id]);

  // ✅ 입력 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "businessNumber") {
      formattedValue = value.replace(/[^0-9]/g, "").replace(/^(\d{3})(\d{2})(\d{0,5}).*/, "$1-$2-$3");
    }

    if (name === "phone") {
      formattedValue = value.replace(/[^0-9]/g, "").replace(/^(\d{3})(\d{3,4})(\d{0,4}).*/, "$1-$2-$3");
    }

    if (name === "accountNumber") {
      formattedValue = formatAccountNumberByBank(form.bank || client?.bank, value);
    }

    if (name === "bank") {
      setForm((prev) => ({
        ...prev,
        bank: value,
        accountNumber: formatAccountNumberByBank(value, prev.accountNumber),
      }));
      return;
    }

    setForm({ ...form, [name]: formattedValue });
  };

  // ✅ 저장 처리
  const handleSave = () => {
    if (!client) return;
    const stored = localStorage.getItem("clients");
    if (!stored) return;

    const clients = JSON.parse(stored);
    const updatedClients = clients.map((c: any) =>
      c.id === id
        ? {
            ...c,
            name: form.name || c.name,
            representative: form.representative || c.representative,
            businessNumber: form.businessNumber || c.businessNumber,
            phone: form.phone || c.phone,
            email: form.email || c.email,
            bank: form.bank || c.bank,
            accountNumber: form.accountNumber || c.accountNumber,
            address: form.address || c.address,
            memo: form.memo || c.memo,
          }
        : c
    );

    localStorage.setItem("clients", JSON.stringify(updatedClients));
    alert("거래처 정보가 수정되었습니다.");
    router.push(`/dashboard/clients/${id}`);
  };

  if (!client) return <div className="text-center mt-10">데이터를 불러오는 중...</div>;

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">거래처 정보 수정</h1>

      {/* 거래처명 */}
      <Input label="거래처명 *" name="name" value={form.name} onChange={handleChange} placeholder={client.name} required />

      {/* 대표자명 */}
      <Input label="대표자명" name="representative" value={form.representative} onChange={handleChange} placeholder={client.representative} />

      {/* 사업자등록번호 */}
      <Input label="사업자등록번호" name="businessNumber" value={form.businessNumber} onChange={handleChange} maxLength={12} placeholder={client.businessNumber} />

      {/* 전화번호 */}
      <Input label="전화번호" name="phone" value={form.phone} onChange={handleChange} maxLength={13} placeholder={client.phone} />

      {/* 이메일 */}
      <Input label="이메일" name="email" value={form.email} onChange={handleChange} placeholder={client.email} type="email" />

      {/* 주소 */}
      <Input label="주소" name="address" value={form.address} onChange={handleChange} placeholder={client.address} />

      {/* 계좌정보 */}
      <div className="mb-4">
        <label className="block font-medium mb-1">계좌 정보</label>
        <div className="flex gap-2">
          <select
            name="bank"
            value={form.bank || client.bank || ""}
            onChange={handleChange}
            className="w-1/3 p-3 text-base border rounded-md"
          >
            <option value="">은행 선택</option>
            {banks.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className="w-2/3 p-3 text-base border rounded-md"
            maxLength={20}
            placeholder={client.accountNumber}
          />
        </div>
      </div>

      {/* 메모 */}
      <div className="mb-4">
        <label className="block font-medium mb-1">메모</label>
        <textarea
          name="memo"
          value={form.memo}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 text-base border rounded-md"
          placeholder={client.memo}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => router.push(`/dashboard/clients/${id}`)}
          className="px-5 py-2 bg-gray-400 text-white rounded-md mr-2"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </div>
  );
}

// ✅ 공용 입력 필드
function Input({ label, name, value, onChange, placeholder, type = "text", maxLength, required = false }: any) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder || ""}
        required={required}
        className="w-full p-3 text-base border rounded-md placeholder-gray-400"
      />
    </div>
  );
}
