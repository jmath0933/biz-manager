"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* 회사 로고 */}
        <Image
          src="/kec-logo.png"
          alt="KEC Logo"
          width={180}
          height={180}
          className="mx-auto mb-6"
        />

        {/* 회사 이름 */}
        <h1 className="text-3xl font-bold text-red-600 mb-10">
          포항케이이씨
        </h1>

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          로그인
        </button>
      </div>
    </main>
  );
}
