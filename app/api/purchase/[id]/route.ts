import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin"; // ✅ 안전한 Firestore 접근 함수 사용

// 📅 날짜 포맷 함수
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

  const db = getFirestoreSafe(); // ✅ Firestore 가져오기
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const docRef = db.collection("purchases").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "매입 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const data = docSnap.data();
    const formatted = {
      id: docSnap.id,
      date: formatDate(data?.date),
      itemName: data?.item || "",
      qty: data?.quantity || 0,
      total: data?.totalAmount || 0,
      supplier: data?.supplier || "",
      ...data,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("🔥 매입 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const data = await request.json();

    // 문자열 날짜일 경우 Date 객체로 변환
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    await db.collection("purchases").doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매입 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    await db.collection("purchases").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 매입 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
