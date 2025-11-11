"use client";

import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";

export default function TestFirestorePage() {
  const [status, setStatus] = useState("");

  const handleTest = async () => {
    try {
      const docRef = await addDoc(collection(db, "testCollection"), {
        message: "Firestore 연결 성공!",
        createdAt: new Date(),
      });
      setStatus(`✅ 문서 추가 완료! ID: ${docRef.id}`);
    } catch (error) {
      console.error(error);
      setStatus("❌ Firestore 연결 실패: 콘솔 확인");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Firestore 연결 테스트</h2>
      <button
        onClick={handleTest}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        테스트 실행
      </button>
      <p>{status}</p>
    </div>
  );
}
