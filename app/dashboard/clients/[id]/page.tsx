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
          <div className="flex items-center justify-between">
            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {client.name}
            </h1>

            {/* 수정하기 버튼: 작게 + 오른쪽 */}
            <button
              onClick={() => router.push(`/dashboard/clients/${id}/edit`)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 
                 text-white text-sm px-3 py-1.5 rounded-md transition"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
          </div>
        </div>


        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>
          </div>

          {/* 첫 줄: 거래처명 + 사업자등록번호 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-800 font-medium mb-2">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{client.name || "-"}</span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>{client.businessNumber || "-"}</span>
            </span>
          </div>

          {/* 두 번째 줄: 회사 전화 + 팩스 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-800 font-medium">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-gray-400" />
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
            </span>

            <span className="flex items-center gap-1">
              <Printer className="w-4 h-4 text-gray-400" />
              {client.faxArea && client.faxMain && client.faxSub ? (
                <span>{client.faxArea}-{client.faxMain}-{client.faxSub}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </span>
          </div>
        </div>


        {/* 대표자 이름 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">{client.representative}</h2>
          </div>



          {/* 전화 + 이메일 가로 배열 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-gray-800">
            {client.phone && (
              <span className="flex items-center gap-1 max-w-[150px] truncate">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                  {client.phone}
                </a>
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1 max-w-[200px] truncate">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`https://mail.naver.com/write?to=${client.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  {client.email}
                </a>
              </span>
            )}
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

            {/* 은행명 + 계좌번호 한 줄 */}
            <div className="flex items-center gap-3 text-gray-800 font-medium text-[15px] flex-wrap">
              {/* 은행명: 칸 좁게 */}
              {client.bank && (
                <span className="flex-shrink-0 w-20 truncate">
                  {client.bank}
                </span>
              )}

              {/* 계좌번호: 나머지 공간 차지 */}
              {client.accountNumber && (
                <span className="flex-1 truncate">
                  {client.accountNumber}
                </span>
              )}
            </div>
          </div>
        )}



        {/* 담당자 목록 */}
        {client.contacts && client.contacts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">담당자</h2>
            </div>

            {/* 담당자별로 줄바꿈되도록 flex-col 강제 */}
            <div className="flex flex-col gap-4">
              {client.contacts.map((contact: Contact, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  {/* 이름 */}
                  <p className="font-semibold text-gray-800 mb-2">{contact.name}</p>

                  {/* 전화 + 이메일은 가로 배열 */}
                  <div className="flex gap-x-6 text-[15px] text-gray-800">
                    {contact.phone && (
                      <span className="flex items-center gap-1 max-w-[150px]">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                          {contact.phone}
                        </a>
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1 max-w-[200px]">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <a
                          href={`https://mail.naver.com/write?to=${contact.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 truncate"
                        >
                          {contact.email}
                        </a>
                      </span>
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