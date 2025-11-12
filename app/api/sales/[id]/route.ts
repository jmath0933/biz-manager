import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // ✅ Admin SDK 사용

// ✅ 단일 매출 조회 (GET /api/sales/[id])
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const docRef = db.collection("sales").doc(id); // ✅ Admin SDK 방식
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
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
    await db.collection("sales").doc(id).update(data); // ✅ 수정
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
    await db.collection("sales").doc(id).delete(); // ✅ 삭제
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매출 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
