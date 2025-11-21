// app/api/clients/[id]/route.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;   // ✅ Promise 해제
    const docRef = doc(db, "clients", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "거래처 없음" }, { status: 404 });
    }

    return NextResponse.json(snapshot.data());
  } catch (err) {
    console.error("API 오류:", err);
    return NextResponse.json({ error: "서버 내부 오류" }, { status: 500 });
  }
}

// 수정 (PATCH)
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  try {
    const docRef = doc(db, "clients", id);
    await updateDoc(docRef, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("수정 오류:", err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

// 삭제 (DELETE)
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const docRef = doc(db, "clients", id);
    await deleteDoc(docRef);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("삭제 오류:", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}