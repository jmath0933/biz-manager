import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// ✅ 단일 매출 조회 (GET /api/sales/[id])
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const docRef = doc(db, "sales", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "매출 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("🔥 매출 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ 매출 수정 (PUT /api/sales/[id])
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await req.json();

  try {
    const docRef = doc(db, "sales", id);
    await updateDoc(docRef, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매출 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ 매출 삭제 (DELETE /api/sales/[id])
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const docRef = doc(db, "sales", id);
    await deleteDoc(docRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매출 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
