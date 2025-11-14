import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";

// GET — 거래처 목록
export async function GET(request: NextRequest) {
  console.log("📡 [API] GET /api/clients 호출됨");
  
  const db = getFirestoreSafe();
  
  if (!db) {
    console.error("❌ Firestore 초기화 실패");
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    console.log("📚 Firestore에서 clients 컬렉션 조회 중...");
    const snapshot = await db.collection("clients").get();
    
    console.log(`✅ ${snapshot.size}개의 문서 조회 성공`);
    
    const clients = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        representative: data.representative,
        phone: data.phone || "",
        email: data.email,
        address: data.address,
        bank: data.bank,
        accountNumber: data.accountNumber,
        memo: data.memo,
        businessNumber: data.businessNumber,
        createdAt: data.createdAt || null,
      };
    });

    console.log("✅ 응답 데이터 준비 완료:", clients.length, "개");
    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error("❌ GET clients error:", error);
    console.error("에러 상세:", error.message, error.stack);
    return NextResponse.json(
      { error: "거래처 목록 조회 실패: " + error.message },
      { status: 500 }
    );
  }
}

// POST — 거래처 추가
export async function POST(request: NextRequest) {
  console.log("📡 [API] POST /api/clients 호출됨");
  
  const db = getFirestoreSafe();
  
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log("📝 추가할 거래처 데이터:", body);
    
    const docRef = await db.collection("clients").add({
      ...body,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ 거래처 추가 성공:", docRef.id);
    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });
  } catch (error: any) {
    console.error("❌ POST client error:", error);
    return NextResponse.json(
      { error: "거래처 추가 실패: " + error.message },
      { status: 500 }
    );
  }
}