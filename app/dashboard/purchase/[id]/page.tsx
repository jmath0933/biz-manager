"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface PurchaseDetail {
  id: string;
  date: number;
  supplier: string;
  customer: string;
  item: string;
  spec: string;
  unitPrice: string;
  quantity: string;
  supplyValue: string;
  tax: string;
  totalAmount: string;
  기준회사: string;
  관계유형: string;
  저장위치: string;
  savedAt: string;
}

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/purchases/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // API에서 날짜를 문자열로 받았다면 숫자로 변환
        if (typeof data.date === "string") {
          data.date = parseInt(data.date.replace(/-/g, ""));
        }
        
        setPurchase(data);
        setEditData(data);
      } catch (error) {
        console.error("매입 상세보기 오류:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchase();
    }
  }, [id]);

  const handleChange = (field: keyof PurchaseDetail, value: any) => {
    if (!editData) return;

    // 날짜 필드일 경우 YYMMDD 숫자로 변환
    if (field === "date") {
      const d = new Date(value);
      const yy = d.getFullYear().toString().slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateCode = parseInt(`${yy}${mm}${dd}`);
      setEditData({ ...editData, date: dateCode });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert("수정이 완료되었습니다!");
        setPurchase(editData);
        setIsEditing(false);
      } else {
        alert("수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("수정 오류:", error);
      alert("수정 실패");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        router.push("/dashboard/purchase");
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  if (loading) return <p className="p-6">불러오는 중...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!purchase || !editData) return <p className="p-6">데이터를 찾을 수 없습니다.</p>;

  const fields: { key: keyof PurchaseDetail; label: string }[] = [
    { key: "date", label: "날짜" },
    { key: "supplier", label: "공급자" },
    { key: "item", label: "품목명" },
    { key: "supplyValue", label: "공급가액" },
    { key: "tax", label: "세액" },
    { key: "totalAmount", label: "합계금액" },
  ];

  const formatDate = (value: number) => {
    const str = value.toString().padStart(6, "0");
    return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
  };

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => router.back()}
        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
      >
        ← 목록으로
      </button>

      <h1 className="text-xl font-bold">매입 상세정보</h1>

      <table className="min-w-[400px] border text-left">
        <tbody>
          {fields.map(({ key, label }) => {
            const value = editData[key];
            return (
              <tr key={key}>
                <th className="border px-3 py-2 w-32 bg-gray-100">{label}</th>
                <td className="border px-3 py-2">
                  {isEditing ? (
                    <input
                      type={key === "date" ? "date" : "text"}
                      value={
                        key === "date"
                          ? (() => {
                              const str = value?.toString().padStart(6, "0");
                              const full = `20${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
                              return full;
                            })()
                          : value ?? ""
                      }
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : key === "date" ? (
                    formatDate(value as number)
                  ) : /^\d+$/.test(value as string) ? (
                    parseInt(value as string).toLocaleString()
                  ) : (
                    value ?? "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-3 mt-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}