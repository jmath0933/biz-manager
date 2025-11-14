import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">로딩 중...</div>}>
      <LoginClient />
    </Suspense>
  );
}
