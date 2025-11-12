import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // ✅ Admin SDK 사용

// ✅ 매입 목록 조회 (GET /api/purchases)
export async function GET() {
  try {
    const snapshot = await db.collection("purchases").orderBy("date", "desc").get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("🔥 매입 목록 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ 매입 등록 (POST /api/purchases)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const docRef = await db.collection("purchases").add(data);
    return NextResponse.json({ id: docRef.id, message: "매입 등록 완료" });
  } catch (error) {
    console.error("🔥 매입 등록 오류:", error);
    return NextResponse.json({ error: "등록 중 오류 발생" }, { status: 500 });
  }
}
