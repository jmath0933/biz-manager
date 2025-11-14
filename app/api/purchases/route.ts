import { NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin";

// 🔧 YYMMDD 숫자 → Date 객체
function parseYYMMDD(num: number): Date | null {
  if (!num) return null;
  const str = String(num).padStart(6, "0");
  const yy = Number(str.slice(0, 2));
  const mm = Number(str.slice(2, 4));
  const dd = Number(str.slice(4, 6));
  const fullYear = 2000 + yy;
  return new Date(fullYear, mm - 1, dd);
}

// 🔧 Date 객체 → yy-mm-dd 문자열
function formatDate(date: any): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

export async function GET(req: Request) {
  const db = getFirestoreSafe();
  if (!db) return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const toCode = (dateStr: string | null) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return Number(`${yy}${mm}${dd}`);
    };

    const startCode = toCode(start);
    const endCode = toCode(end);

    if (!startCode || !endCode) {
      return NextResponse.json({ error: "날짜 파라미터가 잘못되었습니다." }, { status: 400 });
    }

    const snapshot = await db
      .collection("purchases")
      .where("date", ">=", startCode)
      .where("date", "<=", endCode)
      .orderBy("date", "desc")
      .get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      const parsedDate = parseYYMMDD(d.date);

      // 🔧 totalAmount 문자열 → 숫자 변환
      const total =
        typeof d.totalAmount === "string"
          ? parseInt(d.totalAmount.replace(/,/g, ""))
          : typeof d.totalAmount === "number"
          ? d.totalAmount
          : 0;

      return {
        id: doc.id,
        date: parsedDate ? formatDate(parsedDate) : "",
        dateRaw: d.date || 0,
        itemName: d.item || "",
        qty: d.quantity || 0,
        total,
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
