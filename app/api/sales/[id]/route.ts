import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin";

// Context 타입 정의 (Next.js 15)
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET — 상세
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    const snap = await db.collection("sales").doc(id).get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "데이터 없음" },
        { status: 404 }
      );
    }

    const data = snap.data();

    // 날짜를 숫자 그대로 반환 (클라이언트에서 포맷팅)
    return NextResponse.json({
      id: snap.id,
      ...data,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "데이터 조회 실패" },
      { status: 500 }
    );
  }
}

// PUT — 수정
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const db = getFirestoreSafe();

  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // date가 문자열이면 숫자로 변환
    if (typeof body.date === "string") {
      // YY-MM-DD 형식
      if (/^\d{2}-\d{2}-\d{2}$/.test(body.date)) {
        body.date = parseInt(body.date.replace(/-/g, ""));
      }
      // YYYY-MM-DD 형식
      else if (/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
        body.date = parseInt(body.date.slice(2).replace(/-/g, ""));
      }
    }

    await db.collection("sales").doc(id).update(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "수정 실패" },
      { status: 500 }
    );
  }
}

// DELETE — 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const db = getFirestoreSafe();

  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    await db.collection("sales").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "삭제 실패" },
      { status: 500 }
    );
  }
}
