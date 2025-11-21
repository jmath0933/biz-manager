//components/clients/ClientForm.tsx입니다
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, ArrowLeft } from "lucide-react";

interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface ClientFormData {
  name: string;
  representative: string;
  businessNumber: string;
  phone: string;
  email: string;
  address: string;
  bank: string;
  accountNumber: string;
  telArea: string;
  telMain: string;
  telSub: string;
  faxArea: string;
  faxMain: string;
  faxSub: string;
  memo: string;
  contacts?: Contact[];   // ✅ 선택적으로 contacts 추가
}

export interface ClientFormProps {
  mode: "add" | "edit";
  initialData?: Partial<ClientFormData>;
  clientId?: string;
  onSubmit?: (payload: any) => Promise<void>;
}

const areaCodes = ["02", "031", "032", "033", "041", "042", "043", "051", "052", "053", "054", "055", "061", "062", "063", "064"];

const banks = [
  "국민은행",
  "농협",
  "신한은행",
  "기업은행",
  "우리은행",
  "하나은행",
  "카카오뱅크",
  "토스뱅크",
  "부산은행",
  "수협",
  "SC제일은행",
  "대구은행",
];


const bankPatterns: Record<string, number[]> = {
  국민은행: [3, 2, 5],      // 가장 표준적 (10자리일 경우) — 기존 6-2-6 오류 수정
  농협: [3, 4, 5],          // 301-0123-45678 형태가 표준
  신한은행: [3, 3, 5],      // 110-123-45678
  기업은행: [3, 3, 7],      // 012-345-6789012
  우리은행: [4, 3, 6],      // 1002-123-456789
  하나은행: [3, 3, 6],      // 620-123-456789
  카카오뱅크: [3, 2, 6],    // 333-12-345678
  토스뱅크: [3, 3, 6],      // 100-123-456789
  부산은행: [3, 3, 6],      // 101-123-456789
  수협: [3, 3, 5],          // 201-123-45678 (가장 보편)
  SC제일은행: [3, 2, 6],    // 270-12-345678
  대구은행: [3, 2, 6, 1],   // 508-12-345678-9 (특이 패턴)
};


// 사업자등록번호 포맷팅 (000-00-00000)
const formatBusinessNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
};

// 핸드폰 포맷팅 (010-0000-0000)
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 계좌번호 포맷팅
const formatAccountNumber = (bank: string, value: string) => {
  const numbers = value.replace(/\D/g, "");
  const pattern = bankPatterns[bank];
  if (!pattern) return numbers;

  let result = "";
  let index = 0;

  for (let i = 0; i < pattern.length; i++) {
    const part = numbers.substr(index, pattern[i]);
    if (!part) break;
    result += part;
    index += pattern[i];
    if (i < pattern.length - 1 && part.length === pattern[i]) {
      result += "-";
    }
  }
  return result;
};

export default function ClientForm({ 
  mode, 
  initialData = {}, 
  clientId, 
  onSubmit 
}: ClientFormProps) {
  const router = useRouter();
  const [customBankMode, setCustomBankMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<ClientFormData>({
    name: initialData.name || "",
    representative: initialData.representative || "",
    businessNumber: initialData.businessNumber || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
    bank: initialData.bank || "",
    accountNumber: initialData.accountNumber || "",
    telArea: initialData.telArea || "054",
    telMain: initialData.telMain || "",
    telSub: initialData.telSub || "",
    faxArea: initialData.faxArea || "054",
    faxMain: initialData.faxMain || "",
    faxSub: initialData.faxSub || "",
    memo: initialData.memo || "",
  });

  const [contacts, setContacts] = useState<Contact[]>(initialData.contacts || []);

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessNumberChange = (value: string) => {
    const formatted = formatBusinessNumber(value);
    handleChange("businessNumber", formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleChange("phone", formatted);
  };

  const handleAccountNumberChange = (value: string) => {
    if (customBankMode) {
    // 직접 입력 모드에서는 숫자와 하이픈 허용
    const formatted = value.replace(/[^0-9-]/g, "");
    handleChange("accountNumber", formatted);
    return;
  }
    if (!form.bank) {
      alert("먼저 은행을 선택해주세요");
      return;
    }
    const formatted = formatAccountNumber(form.bank, value);
    handleChange("accountNumber", formatted);
  };

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { name: "", phone: "", email: "" }]);
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    if (field === "phone") {
      updated[index][field] = formatPhone(value);
    } else {
      updated[index][field] = value;
    }
    setContacts(updated);
  };

  const handleRemoveContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!form.name.trim()) {
      alert("거래처명을 입력해주세요");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      tel: `${form.telArea}-${form.telMain}-${form.telSub}`,
      fax: `${form.faxArea}-${form.faxMain}-${form.faxSub}`,
      contacts,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            createdAt: new Date().toISOString(),
          }),
        });

        if (!res.ok) throw new Error("등록 실패");

        alert("거래처가 등록되었습니다!");
        router.push("/dashboard/clients");
      }
    } catch (err) {
      console.error(`${mode === "add" ? "등록" : "수정"} 오류:`, err);
      alert(`${mode === "add" ? "등록" : "수정"} 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">기본 정보</h2>
            
            {/* 거래처명 (필수) */}
            <div className="mb-4">
              <label className="block font-medium mb-2 text-red-600">
                거래처명 <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="거래처명을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 대표자명 */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">대표자명</label>
                <input
                  value={form.representative}
                  onChange={(e) => handleChange("representative", e.target.value)}
                  placeholder="대표자명"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 사업자등록번호 */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">사업자등록번호</label>
                <input
                  value={form.businessNumber}
                  onChange={(e) => handleBusinessNumberChange(e.target.value)}
                  placeholder="000-00-00000"
                  maxLength={12}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">연락처 정보</h2>
            
            {/* 회사 전화 */}
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">회사 전화</label>
              <div className="flex flex-wrap gap-2">
  <select
    value={form.telArea}
    onChange={(e) => handleChange("telArea", e.target.value)}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    {areaCodes.map((code) => (
      <option key={code} value={code}>{code}</option>
    ))}
  </select>
  <input
    value={form.telMain}
    onChange={(e) => handleChange("telMain", e.target.value.replace(/\D/g, ""))}
    placeholder="0000"
    maxLength={4}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <input
    value={form.telSub}
    onChange={(e) => handleChange("telSub", e.target.value.replace(/\D/g, ""))}
    placeholder="0000"
    maxLength={4}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>

            </div>

            {/* 팩스 */}
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">팩스</label>
              <div className="flex flex-wrap gap-2">
  <select
    value={form.faxArea}
    onChange={(e) => handleChange("faxArea", e.target.value)}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    {areaCodes.map((code) => (
      <option key={code} value={code}>{code}</option>
    ))}
  </select>
  <input
    value={form.faxMain}
    onChange={(e) => handleChange("faxMain", e.target.value.replace(/\D/g, ""))}
    placeholder="0000"
    maxLength={4}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <input
    value={form.faxSub}
    onChange={(e) => handleChange("faxSub", e.target.value.replace(/\D/g, ""))}
    placeholder="0000"
    maxLength={4}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 대표자 핸드폰 */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">대표자 핸드폰</label>
                <input
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 대표자 이메일 */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">대표자 이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 주소 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">주소</h2>
            <input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="주소를 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 계좌 정보 */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">계좌 정보</h2>
  <div className="flex flex-wrap gap-2">
    {/* 은행명 */}
    {customBankMode ? (
      <input
        value={form.bank}
        onChange={(e) => handleChange("bank", e.target.value)}
        placeholder="은행명을 직접 입력하세요"
        className="min-w-0 max-w-[160px] flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    ) : (
      <select
        value={form.bank}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setCustomBankMode(true);
            handleChange("bank", "");
          } else {
            handleChange("bank", e.target.value);
            handleChange("accountNumber", "");
          }
        }}
        className="min-w-0 max-w-[160px] flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">은행 선택</option>
        {banks.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
        <option value="__custom__">직접 입력</option>
      </select>
    )}

    {/* 계좌번호 */}
    <input
      value={form.accountNumber}
      onChange={(e) => handleAccountNumberChange(e.target.value)}
      placeholder={form.bank || customBankMode ? "계좌번호를 입력하세요" : "먼저 은행을 선택하세요"}
      disabled={!form.bank && !customBankMode}
      className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
    />
  </div>
</div>


          {/* 담당자 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">담당자</h2>
              <button
                type="button"
                onClick={handleAddContact}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" />
                담당자 추가
              </button>
            </div>

            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">등록된 담당자가 없습니다</p>
              ) : (
                contacts.map((contact, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-3">
  <input
    value={contact.name}
    onChange={(e) => handleContactChange(index, "name", e.target.value)}
    placeholder="이름"
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <input
    value={contact.phone}
    onChange={(e) => handleContactChange(index, "phone", e.target.value)}
    placeholder="010-0000-0000"
    maxLength={13}
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <input
    type="email"
    value={contact.email}
    onChange={(e) => handleContactChange(index, "email", e.target.value)}
    placeholder="email@example.com"
    className="min-w-0 flex-[1_1_0%] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <button
    type="button"
    onClick={() => handleRemoveContact(index)}
    className="flex-none text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition"
  >
    <X className="w-4 h-4" />
  </button>
</div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">메모</h2>
            <textarea
              value={form.memo}
              onChange={(e) => handleChange("memo", e.target.value)}
              placeholder="메모를 입력하세요"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/clients")}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "처리 중..." : mode === "add" ? "등록하기" : "수정하기"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}