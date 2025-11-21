"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, Home, Users, ShoppingCart, TrendingUp, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("loggedInUser");
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setLoading(false);
        } else {
          const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
        }
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("loggedInUser");
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/dashboard", label: "홈", icon: Home },
    { href: "/dashboard/clients", label: "거래처", icon: Users },
    { href: "/dashboard/purchase", label: "매입", icon: ShoppingCart },
    { href: "/dashboard/sales", label: "매출", icon: TrendingUp },
    { href: "/dashboard/stats", label: "통계", icon: BarChart3 },
    { href: "/dashboard/", label: "견적", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">인증 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 상단 헤더 - sticky */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">Pohang-KEC</h1>
              <span className="hidden sm:inline text-sm text-gray-500">
                환영합니다, <span className="font-medium text-gray-700">{user.name}</span>님
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 네비게이션 바 - 헤더 아래 sticky */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 스크롤되는 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto pb-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Pohang-KEC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
