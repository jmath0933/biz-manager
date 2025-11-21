// app/api/clients/[id]/route.ts입니다

// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";

// GET — 거래처 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Promise 해제

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const docRef = db.collection("clients").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "거래처 없음" }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error: any) {
    console.error("❌ GET client error:", error);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// PATCH — 거래처 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Promise 해제
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const docRef = db.collection("clients").doc(id);
    await docRef.update(body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ PATCH client error:", error);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

// DELETE — 거래처 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Promise 해제
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const docRef = db.collection("clients").doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE client error:", error);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
