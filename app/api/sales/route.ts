import { NextRequest, NextResponse } from "next/server";
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

// ✅ 날짜 문자열 → YYMMDD 숫자 변환
function toDateCode(dateStr: string): number {
  const d = new Date(dateStr);
  const yy = d.getFullYear().toString().slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return parseInt(`${yy}${mm}${dd}`);
}

// ✅ 매출 목록 조회 (GET /api/sales?start=YYYY-MM-DD&end=YYYY-MM-DD)
export async function GET(request: NextRequest) {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "start와 end 날짜가 필요합니다." },
        { status: 400 }
      );
    }

    const startCode = toDateCode(start);
    const endCode = toDateCode(end);

    const snapshot = await db
      .collection("sales")
      .where("date", ">=", startCode)
      .where("date", "<=", endCode)
      .orderBy("date", "desc")
      .get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      const parsedDate = parseYYMMDD(d.date);

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
        customer: d.customer || "",
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🔥 매출 목록 조회 오류:", error);
    return NextResponse.json({ error: error.message || "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ 매출 등록 (POST /api/sales)
export async function POST(request: NextRequest) {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const body = await request.json();

    if (!body.date || !body.item || !body.totalAmount) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const dateCode =
      typeof body.date === "number" ? body.date : toDateCode(body.date);

    const docRef = await db.collection("sales").add({
      ...body,
      date: dateCode,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error) {
    console.error("🔥 매출 등록 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
