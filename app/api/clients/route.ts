//api/clients/route.ts입니다

// app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";

// GET — 거래처 목록 조회
export async function GET() {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json([], { status: 500 });
  }

  try {
    const snapshot = await db.collection("clients").get();
    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(clients); // 👉 배열 반환
  } catch (error: any) {
    console.error("❌ GET clients error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — 거래처 추가
export async function POST(request: NextRequest) {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const docRef = await db.collection("clients").add({
      ...body,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST client error:", error);
    return NextResponse.json({ error: "거래처 추가 실패" }, { status: 500 });
  }
}
