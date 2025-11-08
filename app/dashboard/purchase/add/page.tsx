"use client";

import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function PurchaseAddPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    itemName: "",
    tax: "",
    spec: "",
    total: "",
    supplyPrice: "",
    qty: 1, // ✅ 기본값 1
    unitPrice: "",
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    receiver: "김정구",
  });

  const [manualTax, setManualTax] = useState(false); // ✅ 세액 직접입력 모드 여부

  // ✅ 공급가 자동 계산 (단가 × 수량)
  useEffect(() => {
    const { unitPrice, qty } = formData;
    if (!unitPrice || !qty) return;

    const supplyPrice = Number(unitPrice) * Number(qty);
    setFormData((prev) => ({
      ...prev,
      supplyPrice: supplyPrice.toLocaleString(),
    }));
  }, [formData.unitPrice, formData.qty]);

  // ✅ 세액 자동 계산 (공급가의 10%), 단 직접입력 모드가 아닐 때만
  useEffect(() => {
    if (manualTax) return; // 직접입력 모드면 자동 계산 X

    const supply = Number(formData.supplyPrice.replace(/,/g, "")) || 0;
    const tax = Math.floor(supply * 0.1);
    setFormData((prev) => ({
      ...prev,
      tax: tax.toLocaleString(),
    }));
  }, [formData.supplyPrice, manualTax]);

  // ✅ 합계 계산 (공급가 + 세액)
  useEffect(() => {
    const supply = Number(formData.supplyPrice.replace(/,/g, "")) || 0;
    const tax = Number(formData.tax.replace(/,/g, "")) || 0;
    const total = supply + tax;
    setFormData((prev) => ({
      ...prev,
      total: total.toLocaleString(),
    }));
  }, [formData.supplyPrice, formData.tax]);

  // ✅ 입력 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Firestore 저장
  const handleSave = async () => {
    try {
      await addDoc(collection(db, "purchases"), {
        ...formData,
        supplyPrice: Number(formData.supplyPrice.replace(/,/g, "")),
        tax: Number(formData.tax.replace(/,/g, "")),
        total: Number(formData.total.replace(/,/g, "")),
        qty: Number(formData.qty),
      });
      alert("매입 정보가 저장되었습니다 ✅");
      router.push("/dashboard/purchase");
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다 ❌");
    }
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-xl font-bold mb-4">매입 직접 입력</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">품목명</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">단가</label>
          <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-right"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">수량</label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-right"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">공급가</label>
          <input
            type="text"
            name="supplyPrice"
            value={formData.supplyPrice}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-right"
            readOnly
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="font-semibold mb-1">세액</label>
            <button
              onClick={() => setManualTax((prev) => !prev)}
              className={`text-xs px-2 py-1 rounded ${
                manualTax ? "bg-yellow-200" : "bg-gray-100"
              }`}
            >
              {manualTax ? "자동계산" : "직접입력"}
            </button>
          </div>
          <input
            type="text"
            name="tax"
            value={formData.tax}
            onChange={handleChange}
            className={`w-full border rounded px-2 py-1 text-right ${
              manualTax ? "" : "bg-gray-50"
            }`}
            readOnly={!manualTax}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">합계금액</label>
          <input
            type="text"
            name="total"
            value={formData.total}
            readOnly
            className="w-full border rounded px-2 py-1 text-right bg-gray-50"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">규격</label>
          <input
            type="text"
            name="spec"
            value={formData.spec}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">날짜</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">공급자</label>
          <input
            type="text"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">수신자</label>
          <input
            type="text"
            name="receiver"
            value={formData.receiver}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </div>
  );
}
