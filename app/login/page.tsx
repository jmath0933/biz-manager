"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const users = [
  { id: "jmath0933", pw: "1111", name: "김정구" },
  { id: "cjstk2430", pw: "", name: "김정은" },
  { id: "kys2430", pw: "", name: "김복선" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = users.find((u) => u.id === id && u.pw === pw);

      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        router.push(redirectUrl);
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">로그인</h2>
          <p className="text-gray-600 text-sm">계정 정보를 입력하세요</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              id="id"
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="pw" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="pw"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">개발용 계정:</p>
          <div className="space-y-1">
            {users.map((user) => (
              <p key={user.id} className="text-xs text-gray-600">
                • {user.name} ({user.id})
              </p>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
