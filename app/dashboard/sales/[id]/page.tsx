"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SalesDetail {
  id: string;
  date: number; // YYMMDD
  customer: string;
  supplier?: string;
  item: string;
  spec: string;
  unitPrice: string;
  quantity: string;
  supplyValue: string;
  tax: string;
  totalAmount: string;
}

export default function SalesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sales, setSales] = useState<SalesDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SalesDetail | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const ref = doc(db, "sales", id as string);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as SalesDetail;
          setSales(data);
          setEditData(data);
        } else {
          console.warn("해당 매출 데이터를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("매출 상세보기 오류:", error);
      }
    };
    fetchSales();
  }, [id]);

  const handleChange = (field: keyof SalesDetail, value: any) => {
    if (!editData) return;

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
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert("수정이 완료되었습니다!");
        setSales(editData);
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
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        router.push("/dashboard/sales");
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  if (!sales || !editData) return <p className="p-6">불러오는 중...</p>;

  const fields: { key: keyof SalesDetail; label: string }[] = [
    { key: "date", label: "날짜" },
    { key: "customer", label: "업체" },
    { key: "item", label: "품목명" },
    { key: "supplyValue", label: "공급가액" },
    { key: "tax", label: "세액" },
    { key: "totalAmount", label: "합계금액" },
  ];

  const formatDate = (code: number) => {
    const str = code.toString().padStart(6, "0");
    return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/,/g, "") || "0");
    return num.toLocaleString();
  };

  return (
    <div className="p-6 space-y-4">
      <button onClick={() => router.back()} className="bg-gray-300 px-3 py-1 rounded">
        ← 목록으로
      </button>

      <h1 className="text-xl font-bold">매출 상세정보</h1>

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
                              const str = (value ?? "").toString().padStart(6, "0");
                              return `20${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
                           })()
                          : value ?? ""
                      }
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : key === "date" ? (
                    formatDate(value as number)
                  ) : typeof value === "string" && /^\d+(,\d{3})*$/.test(value) ? (
                    formatCurrency(value)
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
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
