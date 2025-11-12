"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase"; // ✅ Firestore 연결
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddClientPage() {
  const router = useRouter();

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
        return digits.replace(/^(\d{3})(\d{6})(\d{0,5}).*/, "$1-$2-$3");
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

  // ✅ 입력 변경 처리
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
      formattedValue = formatAccountNumberByBank(form.bank, value);
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

  // ✅ 거래처 Firestore 저장
  const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  if (!form.name.trim()) {
    alert("거래처명을 입력해주세요.");
    return;
  }

  if (isSaving) return; // 중복 저장 방지
  setIsSaving(true);

  try {
    const docRef = await addDoc(collection(db, "clients"), {
      ...form,
      createdAt: serverTimestamp(),
    });
    alert(`거래처가 추가되었습니다. (ID: ${docRef.id})`);
    router.push("/dashboard/clients");
  } catch (error) {
    console.error("거래처 추가 오류:", error);
    alert("거래처 추가 중 오류가 발생했습니다.");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">새 거래처 추가</h1>

      {/* 거래처명 */}
      <Input label="거래처명 *" name="name" value={form.name} onChange={handleChange} placeholder="예: 포항케이이씨" required />

      {/* 대표자명 */}
      <Input label="대표자명" name="representative" value={form.representative} onChange={handleChange} placeholder="예: 김정구" />

      {/* 사업자등록번호 */}
      <Input label="사업자등록번호" name="businessNumber" value={form.businessNumber} onChange={handleChange} maxLength={12} placeholder="000-00-00000" />

      {/* 전화번호 */}
      <Input label="전화번호" name="phone" value={form.phone} onChange={handleChange} maxLength={13} placeholder="010-0000-0000" />

      {/* 이메일 */}
      <Input label="이메일" name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" type="email" />

      {/* 주소 */}
      <Input label="주소" name="address" value={form.address} onChange={handleChange} placeholder="주소를 입력하세요" />

      {/* 계좌정보 */}
      <div className="mb-4">
        <label className="block font-medium mb-1">계좌 정보</label>
        <div className="flex gap-2">
          <select
            name="bank"
            value={form.bank}
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
            placeholder="000-0000-0000-00"
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
          placeholder="메모를 입력하세요"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="px-5 py-2 bg-gray-400 text-white rounded-md mr-2"
        >
          취소
        </button>
        <button
  onClick={handleSave}
  disabled={isSaving}
  className={`px-5 py-2 rounded-md text-white ${isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
>
  {isSaving ? "저장 중..." : "저장"}
</button>

      </div>
    </div>
  );
}

// ✅ 공용 입력 필드 컴포넌트
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
        placeholder={placeholder}
        required={required}
        className="w-full p-3 text-base border rounded-md"
      />
    </div>
  );
}
