import { NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";

// ✅ 날짜 포맷 (yy-mm-dd)
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

// ✅ 매출 목록 조회 (GET /api/sales?start=YYYY-MM-DD&end=YYYY-MM-DD)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let queryRef = db.collection("sales").orderBy("date", "desc");

    // 📅 날짜 필터 적용
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      queryRef = db
        .collection("sales")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .orderBy("date", "desc");
    }

    const snapshot = await queryRef.get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        date: formatDate(d.date),
        item: d.item || "",
        totalAmount: d.totalAmount || 0,
        customer: d.customer || "",
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🔥 매출 목록 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류 발생" },
      { status: 500 }
    );
  }
}

// ✅ 매출 등록 (POST /api/sales)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 문자열 날짜를 Firestore용 Date로 변환
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    const docRef = await db.collection("sales").add(data);
    return NextResponse.json({ id: docRef.id, message: "등록되었습니다." });
  } catch (error: any) {
    console.error("🔥 매출 등록 오류:", error);
    return NextResponse.json(
      { error: error.message || "등록 중 오류 발생" },
      { status: 500 }
    );
  }
}
