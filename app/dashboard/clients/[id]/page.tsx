"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  representative?: string;
  businessNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  bank?: string;
  accountNumber?: string;
  memo?: string;
  createdAt?: string; // string으로 통일
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) {
          setLoading(false);
          return;
        }

        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // ✅ createdAt이 Timestamp인 경우 문자열로 변환
          if (data.createdAt instanceof Timestamp) {
            data.createdAt = data.createdAt.toDate().toISOString();
          } else if (!data.createdAt) {
            data.createdAt = new Date().toISOString();
          }

          console.log("🔥 Firestore data:", data);

          setClient({ id: docSnap.id, ...(data as any) } as Client);
        } else {
          setClient(null);
        }
      } catch (err) {
        console.error("거래처 불러오기 실패:", err);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex flex-col items-center mt-10 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mb-2" />
        로딩 중...
      </div>
    );

  if (!client)
    return (
      <div className="text-center text-red-500 mt-10">
        해당 거래처를 찾을 수 없습니다.
      </div>
    );

  const handleEdit = () => {
    router.push(`/dashboard/clients/${client.id}/edit`);
  };

  const handleBack = () => {
    router.push("/dashboard/clients");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        거래처 상세정보
      </h2>

      <div className="flex flex-col gap-4 text-gray-700">
        <div>
          <span className="text-sm text-gray-500">거래처명</span>
          <div className="font-medium text-lg">{client.name}</div>
        </div>

        <div>
          <span className="text-sm text-gray-500">대표자</span>
          <div>{client.representative || "-"}</div>
        </div>

        <div>
          <span className="text-sm text-gray-500">전화번호</span>
          <div>{client.phone || "-"}</div>
        </div>

        <div>
          <span className="text-sm text-gray-500">이메일</span>
          <div>{client.email || "-"}</div>
        </div>

        <div>
          <span className="text-sm text-gray-500">주소</span>
          <div>{client.address || "-"}</div>
        </div>

       
<div>
  <span className="text-sm text-gray-500">계좌정보</span>
  <div>
    {/* 디버그: 실제 불러온 데이터 구조 확인 (개발 중에만 활성화) */}
    {/* console.log는 클라이언트 브라우저 콘솔에 찍힙니다. */}
    

    {/* 여러 가능한 저장 구조를 안전하게 처리 */}
    {(() => {
      // 1) bank + accountNumber 필드가 따로 있는 경우
      if (client.bank && client.accountNumber) {
        return `${client.bank} ${client.accountNumber}`;
      }

      // 2) account 필드가 문자열로 저장된 경우 (예: "기업은행 123-123-123")
      if ((client as any).account && typeof (client as any).account === "string") {
        return (client as any).account;
      }

      // 3) account 객체로 저장된 경우 (예: account: { bank: '기업은행', number: '123...' })
      const acc = (client as any).account;
      if (acc && typeof acc === "object") {
        const bank = acc.bank || acc.name || "";
        const num = acc.number || acc.no || acc.value || "";
        if (bank && num) return `${bank} ${num}`;
        if (bank) return bank;
        if (num) return num;
      }

      // 4) bank만 있거나 accountNumber만 있는 경우
      if (client.bank) return client.bank;
      if (client.accountNumber) return client.accountNumber;

      return "-";
    })()}
  </div>
</div>


        <div>
          <span className="text-sm text-gray-500">메모</span>
          <div className="whitespace-pre-wrap border rounded-md p-2 bg-gray-50">
            {client.memo || "-"}
          </div>
        </div>

        {client.createdAt && (
          <div className="text-right text-xs text-gray-400">
            등록일:{" "}
            {new Date(client.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          목록으로
        </button>

        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}
