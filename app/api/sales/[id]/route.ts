import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";

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

// ✅ GET
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const docRef = db.collection("sales").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "매출 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const data = docSnap.data();
    const formatted = {
      id: docSnap.id,
      date: formatDate(data?.date),
      itemName: data?.item || "",
      qty: data?.quantity || 0,
      total: data?.totalAmount || 0,
      customer: data?.customer || "",
      ...data,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("🔥 매출 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const data = await request.json();
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    await db.collection("sales").doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매출 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await db.collection("sales").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매출 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}