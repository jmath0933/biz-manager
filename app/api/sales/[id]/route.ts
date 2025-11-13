import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// ✅ 날짜 포맷 함수 (yy-mm-dd)
function formatDate(date: any): string {
  try {
    const d = date?._seconds ? new Date(date._seconds * 1000) : new Date(date);
    if (isNaN(d.getTime())) return "";
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

// ✅ 단일 매출 조회 (GET /api/sales/[id])
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const docRef = db.collection("sales").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "매출 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const data = docSnap.data();

    const formattedData = {
      id: docSnap.id,
      date: formatDate(data?.date),
      itemName: data?.item || "",
      qty: data?.quantity || 0,
      total: data?.totalAmount || 0,
      customer: data?.customer || "",
      ...data, // 🔹 나머지 필드가 있다면 유지
    };

    return NextResponse.json(formattedData);
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

  try {
    const data = await req.json();

    // 문자열 날짜를 Date 객체로 변환 (Firestore용)
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    await db.collection("sales").doc(id).update(data);
    return NextResponse.json({ success: true, message: "수정되었습니다." });
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
    await db.collection("sales").doc(id).delete();
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error) {
    console.error("🔥 매출 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
