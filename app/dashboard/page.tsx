"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const menus = [
    { name: "거래처 관리", path: "/dashboard/clients", color: "bg-blue-500" },
    { name: "매입 관리", path: "/dashboard/purchase", color: "bg-green-500" },
    { name: "매출 관리", path: "/dashboard/sales", color: "bg-yellow-500" },
    { name: "통계", path: "/dashboard/stats", color: "bg-purple-500" },
  ];

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-10">📊 비즈 매니저 대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {menus.map((menu) => (
          <button
            key={menu.name}
            onClick={() => router.push(menu.path)}
            className={`${menu.color} text-white text-lg font-semibold py-6 rounded-2xl shadow-lg hover:opacity-90 transition`}
          >
            {menu.name}
          </button>
        ))}
      </div>
    </div>
  );
}
