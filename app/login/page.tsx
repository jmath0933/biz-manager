"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const users = [
  { id: "jmath0933", pw: "0933jmath", name: "김정구" },
  { id: "cjstk2430", pw: "2430cjstk", name: "김정은" },
  { id: "kys2430", pw: "2430kys", name: "김복선" },
];

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.id === id && u.pw === pw);

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}
