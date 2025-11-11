"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

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
  const [loading, setLoading] = useState(true);

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

  // ✅ 은행별 계좌번호 포맷
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

  // ✅ Firestore에서 거래처 데이터 불러오기
  useEffect(() => {
    if (!id) return;

    const fetchClient = async () => {
      try {
        const docRef = doc(db, "clients", id as string);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setClient({ id: snapshot.id, ...data });
          setForm({
            name: data.name || "",
            representative: data.representative || "",
            businessNumber: data.businessNumber || "",
            phone: data.phone || "",
            email: data.email || "",
            bank: data.bank || "",
            accountNumber: data.accountNumber || "",
            address: data.address || "",
            memo: data.memo || "",
          });
        } else {
          alert("해당 거래처를 찾을 수 없습니다.");
          router.push("/dashboard/clients");
        }
      } catch (error) {
        console.error("데이터 불러오기 오류:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, router]);

  // ✅ 입력값 변경 처리
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "businessNumber") {
      formattedValue = value
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{3})(\d{2})(\d{0,5}).*/, "$1-$2-$3");
    }

    if (name === "phone") {
      formattedValue = value
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{3})(\d{3,4})(\d{0,4}).*/, "$1-$2-$3");
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

  // ✅ Firestore 업데이트
  const handleSave = async () => {
    try {
      const docRef = doc(db, "clients", id as string);
      await updateDoc(docRef, form);
      alert("거래처 정보가 수정되었습니다.");
      router.push(`/dashboard/clients/${id}`);
    } catch (error) {
      console.error("업데이트 실패:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ Firestore 삭제
  const handleDelete = async () => {
    if (!confirm("정말로 이 거래처를 삭제하시겠습니까?")) return;
    try {
      const docRef = doc(db, "clients", id as string);
      await deleteDoc(docRef);
      alert("거래처가 삭제되었습니다.");
      router.push("/dashboard/clients");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="text-center mt-10">데이터를 불러오는 중...</div>;

  if (!client) return <div className="text-center mt-10">거래처를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">거래처 정보 수정</h1>

      <Input label="거래처명 *" name="name" value={form.name} onChange={handleChange} required />
      <Input label="대표자명" name="representative" value={form.representative} onChange={handleChange} />
      <Input label="사업자등록번호" name="businessNumber" value={form.businessNumber} onChange={handleChange} maxLength={12} />
      <Input label="전화번호" name="phone" value={form.phone} onChange={handleChange} maxLength={13} />
      <Input label="이메일" name="email" value={form.email} onChange={handleChange} type="email" />
      <Input label="주소" name="address" value={form.address} onChange={handleChange} />

      {/* 계좌 정보 */}
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
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-wrap justify-end mt-6 gap-2">
        <button
          onClick={() => router.push(`/dashboard/clients/${id}`)}
          className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          저장
        </button>
        <button
          onClick={handleDelete}
          className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

// ✅ 공용 입력 컴포넌트
function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  required = false,
}: any) {
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
