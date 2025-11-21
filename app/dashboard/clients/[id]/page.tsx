//dashboard/clients/[id]/page.tsx입니다

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Edit, Building2, User, Phone, Mail, MapPin, CreditCard, FileText } from "lucide-react";

type Contact = {
  name: string;
  phone: string;
  email: string;
};


export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        return res.json();
      })
      .then((data) => setClient(data))
      .catch((err) => console.error("상세페이지 오류:", err));
  }, [id]);

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">거래처를 찾을 수 없습니다</p>
          <button
            onClick={() => router.push("/dashboard/clients")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
         
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{client.name}</h1>
            <button
              onClick={() => router.push(`/dashboard/clients/${id}/edit`)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <Edit className="w-5 h-5" />
              수정하기
            </button>
          </div>
        </div>

        {/* 기본 정보 */}
<div className="bg-white rounded-lg shadow p-6 mb-4">
  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
    <Building2 className="w-5 h-5 text-blue-600" />
    <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* 거래처명: 라벨 제거 */}
    <div className="flex items-center gap-2 text-gray-800 font-medium">
      <Building2 className="w-5 h-5 text-gray-400" />
      <span>{client.name || "-"}</span>
    </div>

    {/* 사업자등록번호: 라벨 제거 */}
    <div className="flex items-center gap-2 text-gray-800 font-medium">
      <FileText className="w-5 h-5 text-gray-400" />
      <span>{client.businessNumber || "-"}</span>
    </div>
    {/* 회사 전화: 라벨 제거, 아이콘 + 번호만 */}
    <div className="flex items-center gap-2 text-gray-800 font-medium">
      <Phone className="w-5 h-5 text-gray-400" />
      {client.telArea && client.telMain && client.telSub ? (
        <a
          href={`tel:${client.telArea}${client.telMain}${client.telSub}`}
          className="hover:text-blue-600"
        >
          {client.telArea}-{client.telMain}-{client.telSub}
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </div>

    {/* 팩스: 라벨 제거, 아이콘 + 번호만 */}
    <div className="flex items-center gap-2 text-gray-800 font-medium">
      <Printer className="w-5 h-5 text-gray-400" />
      {client.faxArea && client.faxMain && client.faxSub ? (
        <span>
          {client.faxArea}-{client.faxMain}-{client.faxSub}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </div>
  </div>
</div>

        {/* 대표자 연락처 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">{client.representative}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline font-medium">
                    {client.phone}
                  </a>
                ) : (
                  <p className="text-gray-400">-</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline font-medium break-all">
                    {client.email}
                  </a>
                ) : (
                  <p className="text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 주소 */}
        {client.address && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">주소</h2>
            </div>
            <p className="text-gray-700">{client.address}</p>
          </div>
        )}

        {/* 계좌 정보 */}
{(client.bank || client.accountNumber) && (
  <div className="bg-white rounded-lg shadow p-6 mb-4">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b">
      <CreditCard className="w-5 h-5 text-blue-600" />
      <h2 className="text-lg font-semibold text-gray-800">계좌 정보</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 은행명: 라벨 제거 */}
      {client.bank && (
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <Building2 className="w-5 h-5 text-gray-400" />
          <span>{client.bank}</span>
        </div>
      )}

      {/* 계좌번호: 라벨 제거 */}
      {client.accountNumber && (
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <span>{client.accountNumber}</span>
        </div>
      )}
    </div>
  </div>
)}


        {/* 담당자 목록 */}
        {client.contacts && client.contacts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">담당자 목록</h2>
            </div>
            <div className="space-y-4">
              {client.contacts.map((contact: Contact, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">{contact.name}</p>
                  <div className="space-y-1 text-sm">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600 break-all">
                          {contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        {client.memo && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">메모</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{client.memo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800 font-medium">{value || "-"}</p>
    </div>
  );
}