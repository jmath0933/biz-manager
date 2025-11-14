"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const areaCodes = ["02", "031", "032", "033", "041", "042", "043", "051", "052", "053", "054", "055", "061", "062", "063", "064"];

export default function AddClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    representative: "",
    businessNumber: "",
    phone: "",
    email: "",
    address: "",
    bank: "",
    accountNumber: "",
    telArea: "054",
    telMain: "",
    telSub: "",
    faxArea: "054",
    faxMain: "",
    faxSub: "",
    memo: "",
  });

  const [contacts, setContacts] = useState<{ name: string; role: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { name: "", role: "", phone: "" }]);
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index][field as keyof typeof updated[0]] = value;
    setContacts(updated);
  };

  const handleRemoveContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      tel: `${form.telArea}-${form.telMain}-${form.telSub}`,
      fax: `${form.faxArea}-${form.faxMain}-${form.faxSub}`,
      contacts,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("등록 실패");

      alert("거래처가 등록되었습니다!");
      router.push("/dashboard/clients");
    } catch (err) {
      console.error("등록 오류:", err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 sm:px-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">새 거래처 추가</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 거래처명 */}
        <div>
          <label className="block font-medium mb-1 text-red-600">거래처명 *</label>
          <input
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* 대표자 / 사업자등록번호 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">대표자명</label>
            <input
              value={form.representative}
              onChange={(e) => handleChange("representative", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">사업자등록번호</label>
            <input
              value={form.businessNumber}
              onChange={(e) => handleChange("businessNumber", e.target.value)}
              placeholder="000-00-00000"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* 핸드폰 / 이메일 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">핸드폰</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">이메일</label>
            <input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block font-medium mb-1">주소</label>
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="주소를 입력하세요"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* 회사전화 / 팩스 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["tel", "fax"].map((type) => (
            <div key={type}>
              <label className="block font-medium mb-1">{type === "tel" ? "회사전화" : "팩스"}</label>
              <div className="flex gap-2">
                <select
                  value={form[`${type}Area` as keyof typeof form]}
                  onChange={(e) => handleChange(`${type}Area`, e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  {areaCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  value={form[`${type}Main` as keyof typeof form]}
                  onChange={(e) => handleChange(`${type}Main`, e.target.value)}
                  className="w-20 border rounded-md px-2 py-1"
                />
                <input
                  value={form[`${type}Sub` as keyof typeof form]}
                  onChange={(e) => handleChange(`${type}Sub`, e.target.value)}
                  className="w-20 border rounded-md px-2 py-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 은행 / 계좌 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">은행명</label>
            <input
              value={form.bank}
              onChange={(e) => handleChange("bank", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">계좌번호</label>
            <input
              value={form.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              placeholder="000-0000-0000-00"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* 담당자 추가 */}
<div>
  <label className="block font-medium mb-2">담당자</label>
  <button
    type="button"
    onClick={handleAddContact}
    className="mb-4 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
  >
    + 담당자 추가
  </button>

  <div className="space-y-3">
    {contacts.map((contact, index) => (
      <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          value={contact.name}
          onChange={(e) => handleContactChange(index, "name", e.target.value)}
          placeholder="이름"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <input
          value={contact.role}
          onChange={(e) => handleContactChange(index, "role", e.target.value)}
          placeholder="직책"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <input
          value={contact.phone}
          onChange={(e) => handleContactChange(index, "phone", e.target.value)}
          placeholder="핸드폰"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="button"
          onClick={() => handleRemoveContact(index)}
          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
        >
          삭제
        </button>
      </div>
    ))}
  </div>
</div>
{/* 메모 */}
<div>
  <label className="block font-medium mb-1">메모</label>
  <textarea
    value={form.memo}
    onChange={(e) => handleChange("memo", e.target.value)}
    placeholder="메모를 입력하세요"
    rows={4}
    className="w-full border rounded-md px-3 py-2 resize-none"
  />
</div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md mt-6 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}

