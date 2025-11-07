import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// ✅ 단일 매출 조회 (GET /api/sales/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const docRef = doc(db, "sales", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("매출 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await request.json();
  try {
    const docRef = doc(db, "sales", id);
    await updateDoc(docRef, data);
    return NextResponse.json({ message: "수정되었습니다." });
  } catch (error) {
    console.error("매출 수정 오류:", error);
    return NextResponse.json({ error: "수정 중 오류 발생" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const docRef = doc(db, "sales", id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("매출 삭제 오류:", error);
    return NextResponse.json({ error: "삭제 중 오류 발생" }, { status: 500 });
  }
}
