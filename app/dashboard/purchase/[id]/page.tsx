import React from "react";

export default async function PurchaseDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params; // ❌ await 제거!

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/purchase/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("매입 정보를 불러오지 못했습니다.");
  }

  const data = await res.json();

  return (
    <div className="p-6">
      <button
        onClick={() => history.back()}
        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded mb-4"
      >
        ← 목록으로
      </button>

      <h2 className="text-xl font-bold mb-4">매입 상세정보</h2>

      <table className="border border-gray-300 w-full text-left">
        <tbody>
          <tr>
            <th className="border px-3 py-2 w-40 bg-gray-50">날짜</th>
            <td className="border px-3 py-2">{data.date}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">품목</th>
            <td className="border px-3 py-2">{data.item}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">규격</th>
            <td className="border px-3 py-2">{data.spec}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">수량</th>
            <td className="border px-3 py-2">{data.quantity}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">단가</th>
            <td className="border px-3 py-2">{data.unitPrice?.toLocaleString()}원</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">공급가액</th>
            <td className="border px-3 py-2">{data.supplyAmount?.toLocaleString()}원</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">세액</th>
            <td className="border px-3 py-2">{data.tax?.toLocaleString()}원</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 font-bold bg-gray-50">합계금액</th>
            <td className="border px-3 py-2 font-bold">{data.totalAmount?.toLocaleString()}원</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">공급자</th>
            <td className="border px-3 py-2">{data.supplier}</td>
          </tr>
          <tr>
            <th className="border px-3 py-2 bg-gray-50">받는자</th>
            <td className="border px-3 py-2">{data.receiver}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
