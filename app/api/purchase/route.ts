import { NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";

// ✅ 날짜 포맷 함수 (yy-mm-dd)
function formatDate(date: any): string {
  try {
    const d = date?._seconds ? new Date(date._seconds * 1000) : new Date(date);
    if (isNaN(d.getTime())) return "";
    const yy = String(d.getFullYear()).slice(2); // 2025 → "25"
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

// ✅ 매입 목록 조회 (GET /api/purchases)
export async function GET() {
  try {
    const snapshot = await db.collection("purchases").orderBy("date", "desc").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        date: formatDate(d.date),      // ← 여기서 yy-mm-dd 형식 변환
        itemName: d.item || "",
        qty: d.quantity || 0,
        total: d.totalAmount || 0,
        supplier: d.supplier || "",
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🔥 매입 목록 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류 발생" },
      { status: 500 }
    );
  }
}

// ✅ 매입 등록 (POST /api/purchases)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 문자열 날짜를 Firestore용 Date로 변환
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    const docRef = await db.collection("purchases").add(data);
    return NextResponse.json({ id: docRef.id, message: "등록되었습니다." });
  } catch (error: any) {
    console.error("🔥 매입 등록 오류:", error);
    return NextResponse.json(
      { error: error.message || "등록 중 오류 발생" },
      { status: 500 }
    );
  }
}
