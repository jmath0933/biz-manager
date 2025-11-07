"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function TestFirestoreClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [status, setStatus] = useState("⏳ Firestore에서 데이터 불러오는 중...");

  useEffect(() => {
    try {
      // clients 컬렉션 실시간 구독
      const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("📦 clients 컬렉션:", list);
          setClients(list);

          if (list.length === 0) setStatus("⚠️ clients 컬렉션에 문서가 없습니다.");
          else setStatus(`✅ ${list.length}개의 거래처 데이터를 불러왔습니다.`);
        },
        (error) => {
          console.error("❌ Firestore 구독 오류:", error);
          setStatus("❌ Firestore 구독 오류: 콘솔 확인");
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Firestore 연결 실패:", error);
      setStatus("❌ Firestore 연결 실패");
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧾 Firestore clients 테스트 페이지</h2>
      <p>{status}</p>

      {clients.length > 0 && (
        <ul style={{ marginTop: 20 }}>
          {clients.map((client) => (
            <li
              key={client.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <strong>거래처명:</strong> {client.name || "(이름 없음)"} <br />
              <strong>대표자:</strong> {client.representative || "-"} <br />
              <strong>전화번호:</strong> {client.phone || "-"} <br />
              <strong>등록일:</strong>{" "}
              {client.createdAt?.toDate
                ? client.createdAt.toDate().toLocaleString()
                : "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
