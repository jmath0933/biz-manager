// app/api/purchases/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin";

// 날짜를 YYMMDD 숫자로 변환
function dateToCode(dateStr: string): number {
  // "25-11-10" → "251110"
  if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
    return parseInt(dateStr.replace(/-/g, ""));
  }

  // "2025-11-10" → "251110"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const yy = dateStr.slice(2, 4);
    const mm = dateStr.slice(5, 7);
    const dd = dateStr.slice(8, 10);
    return parseInt(`${yy}${mm}${dd}`);
  }

  // "2025/11/10"
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
    const yy = dateStr.slice(2, 4);
    const mm = dateStr.slice(5, 7);
    const dd = dateStr.slice(8, 10);
    return parseInt(`${yy}${mm}${dd}`);
  }

  return 0;
}

// 숫자 YYMMDD → "YY-MM-DD"
function codeToDate(code: number): string {
  const str = code.toString().padStart(6, "0");
  return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
}

/* -------------------------------------------------------
   GET: 상세 조회
------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    const snap = await db.collection("purchases").doc(id).get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "매입 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const data = snap.data();

    return NextResponse.json({
      id: snap.id,
      date: codeToDate(data?.date ?? 0), // "YY-MM-DD"
      itemName: data?.item || "",
      qty: data?.quantity || 0,
      total: data?.totalAmount || 0,
      supplier: data?.supplier || "",
      ...data,
    });
  } catch (e) {
    console.error("🔥 GET 상세 오류:", e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   PUT: 수정 (숫자 YYMMDD로 저장)
------------------------------------------------------- */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();

    // 날짜가 문자열이면 YYMMDD 숫자로 변환
    if (typeof data.date === "string") {
      data.date = dateToCode(data.date);
    }

    await db.collection("purchases").doc(id).update(data);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("🔥 PUT 수정 오류:", e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   DELETE: 삭제
------------------------------------------------------- */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    await db.collection("purchases").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("🔥 DELETE 삭제 오류:", e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
