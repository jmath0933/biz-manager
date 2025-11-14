"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, User, Building2, Loader2 } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Client {
  id: string;
  name: string;
  representative?: string;
  phone: string;
  email?: string;
  address?: string;
  bank?: string;
  accountNumber?: string;
  memo?: string;
  createdAt?: string;
}

export default function ClientListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let fallbackUnsub: (() => void) | null = null;

  const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        fallbackUnsub = onSnapshot(collection(db, "clients"), (snap2) => {
          const list: Client[] = snap2.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt
                ? new Date(data.createdAt.seconds * 1000).toLocaleString("ko-KR")
                : "-",
            };
          });
          setClients(list);
          setLoading(false);
        });
      } else {
        const list: Client[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toLocaleString("ko-KR")
              : "-",
          };
        });
        setClients(list);
        setLoading(false);
      }
    },
    (err) => {
      console.error("거래처 목록 불러오기 실패:", err);
      setLoading(false);
    }
  );

  return () => {
    unsubscribe();
    if (fallbackUnsub) fallbackUnsub();
  };
}, []);


  const handleAdd = () => router.push("/dashboard/clients/add");
  const handleDetail = (id: string) => router.push(`/dashboard/clients/${id}`);
  const handleCall = (phone: string) => phone && (window.location.href = `tel:${phone}`);
  const handleEmail = (email: string) => {
    if (!email) return;
    const link = email.includes("@naver.com")
      ? "https://mail.naver.com"
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    window.open(link, "_blank");
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.representative ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex flex-col items-center mt-10 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        불러오는 중...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">거래처 관리</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="거래처명 또는 대표자 검색"
            className="flex-1 border rounded-md p-2 text-sm sm:text-base"
          />
          <button
            onClick={handleAdd}
            className="whitespace-nowrap bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
          >
            새 거래처 추가
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => handleDetail(client.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-lg text-gray-800 hover:underline">
                {client.name}
              </span>
            </div>

            {client.representative && (
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <span>{client.representative}</span>
              </div>
            )}

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleCall(client.phone);
              }}
              className="flex items-center gap-2 text-blue-600 text-sm sm:text-base mb-1 hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span>{client.phone || "-"}</span>
            </div>

            {client.email && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmail(client.email!);
                }}
                className="flex items-center gap-2 text-green-600 text-sm sm:text-base hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
            )}

            {(client.bank || client.accountNumber) && (
              <div className="text-gray-600 text-sm sm:text-base">
                💳 {client.bank} {client.accountNumber}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-1">
              등록일: {client.createdAt}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            등록된 거래처가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
