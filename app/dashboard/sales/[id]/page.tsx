"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

interface SaleDetail {
  id: string;
  date: string;
  itemName: string;
  spec: string;
  qty: number;
  unitPrice: number;
  supplyPrice: number;
  tax: number;
  total: number;
  supplier: string;
  receiver: string;
}

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SaleDetail | null>(null);

  // ✅ 매출 데이터 불러오기
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const ref = doc(db, "sales", id as string);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as SaleDetail;
          setSale(data);
          setEditData(data);
        } else {
          console.warn("해당 매출 데이터를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("매출 상세보기 오류:", error);
      }
    };

    fetchSale();
  }, [id]);

  // ✅ 입력 변경 핸들러
  const handleChange = (field: keyof SaleDetail, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  // ✅ 수정 저장
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
        setSale(editData);
        setIsEditing(false);
      } else {
        alert("수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("수정 오류:", error);
      alert("수정 실패");
    }
  };

  // ✅ 삭제
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        router.push("/sales");
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  if (!sale || !editData) return <p className="p-6">불러오는 중...</p>;

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => router.back()}
        className="bg-gray-300 px-3 py-1 rounded"
      >
        ← 목록으로
      </button>

      <h1 className="text-xl font-bold">매출 상세정보</h1>

      <table className="min-w-[400px] border text-left">
        <tbody>
          {Object.entries(editData).map(([key, value]) => (
            key !== "id" && (
              <tr key={key}>
                <th className="border px-3 py-2 w-32 bg-gray-100">{key}</th>
                <td className="border px-3 py-2">
                  {isEditing ? (
                    <input
                      type={
                        typeof value === "number" ? "number" :
                        key === "date" ? "date" : "text"
                      }
                      value={
                        key === "date" && value
                          ? new Date(value).toISOString().substring(0, 10)
                          : value ?? ""
                      }
                      onChange={(e) => handleChange(key as keyof SaleDetail, e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    key === "date"
                      ? new Date(value).toLocaleDateString("ko-KR")
                      : value?.toLocaleString?.() ?? value
                  )}
                </td>
              </tr>
            )
          ))}
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
