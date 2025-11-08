"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Supplier {
  name: string;
  bizNo: string;
  ceo: string;
}

export default function PurchaseAddPage() {
  const router = useRouter();

  // 거래처 자동완성용 상태
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [ceo, setCeo] = useState("");

  // ✅ 수요자 기본값
  const [buyer, setBuyer] = useState("포항케이이씨");

  // 거래 데이터
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | string>("");
  const [tax, setTax] = useState<number | string>("");
  const [manualTax, setManualTax] = useState(false);

  // 거래처 목록 로드 (localStorage 기준)
  useEffect(() => {
    const storedSuppliers = JSON.parse(localStorage.getItem("suppliers") || "[]");
    setSuppliers(storedSuppliers);
  }, []);

  // 거래처 자동완성 필터
  const handleSupplierChange = (value: string) => {
    setSupplierName(value);
    if (value.trim() === "") {
      setFilteredSuppliers([]);
      return;
    }
    const filtered = suppliers.filter((s) =>
      s.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  // 거래처 선택
  const selectSupplier = (supplier: Supplier) => {
    setSupplierName(supplier.name);
    setBizNo(supplier.bizNo);
    setCeo(supplier.ceo);
    setFilteredSuppliers([]);
  };

  // 공급가 입력 시 세액 자동 계산
  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (!manualTax) {
      const num = parseFloat(value) || 0;
      setTax(Math.round(num * 0.1));
    }
  };

  // 등록 처리
  const handleSubmit = () => {
    const newPurchase = {
      supplierName,
      bizNo,
      ceo,
      buyer, // ✅ 수요자 포함
      product,
      qty,
      price,
      tax,
      total: Number(price) + Number(tax),
      date: new Date().toISOString().split("T")[0],
    };

    const existing = JSON.parse(localStorage.getItem("purchases") || "[]");
    existing.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(existing));

    alert("등록이 완료되었습니다 ✅");
    router.push("/purchase");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">매입 직접입력</h1>

      {/* ✅ 수요자 입력 (기본값: 포항케이이씨) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">수요자</label>
        <input
          type="text"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="수요자 입력"
        />
      </div>

      {/* 거래처명 자동완성 */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-1">거래처명 (공급자)</label>
        <input
          type="text"
          value={supplierName}
          onChange={(e) => handleSupplierChange(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="거래처명을 입력하세요"
        />
        {filteredSuppliers.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
            {filteredSuppliers.map((s, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectSupplier(s)}
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">사업자번호</label>
        <input
          type="text"
          value={bizNo}
          onChange={(e) => setBizNo(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">대표자</label>
        <input
          type="text"
          value={ceo}
          onChange={(e) => setCeo(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* 품목/수량/공급가 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">품목</label>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="품목명 입력"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">수량</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="border p-2 rounded w-full text-right"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">공급가</label>
          <input
            type="number"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="border p-2 rounded w-full text-right"
            placeholder="0"
          />
        </div>
      </div>

      {/* 세액 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium">세액</label>
          <button
            onClick={() => setManualTax(!manualTax)}
            className="text-xs text-blue-600"
          >
            {manualTax ? "자동계산으로 변경" : "직접입력"}
          </button>
        </div>
        <input
          type="number"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          className="border p-2 rounded w-full text-right"
          disabled={!manualTax}
        />
      </div>

      {/* 등록 버튼 */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        등록
      </button>
    </div>
  );
}
