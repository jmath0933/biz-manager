import { NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin";

// 날짜 파싱 → Date 객체로 변환
function parseYYMMDD(num: number): Date | null {
  if (!num) return null;
  const str = String(num).padStart(6, "0");
  const yy = Number(str.slice(0, 2));
  const mm = Number(str.slice(2, 4));
  const dd = Number(str.slice(4, 6));
  const fullYear = 2000 + yy;
  return new Date(fullYear, mm - 1, dd);
}

// yy-mm-dd 출력용
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

export async function GET() {
  const db = getFirestoreSafe();
  if (!db) return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });

  try {
    const snapshot = await db.collection("purchases").orderBy("date", "desc").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      const parsedDate = parseYYMMDD(d.date);

      return {
        id: doc.id,
        date: parsedDate ? formatDate(parsedDate) : "",  // yy-mm-dd
        dateRaw: d.date || 0,                            // YYMMDD 숫자
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


// ✅ 매입 등록 시 date를 숫자 YYMMDD로 변환하여 저장
export async function POST(request: Request) {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const data = await request.json();

    // date 문자열 (yyyy-mm-dd 또는 yyyy/mm/dd 등)을 YYMMDD 숫자로 변환
    if (typeof data.date === "string") {
      const d = new Date(data.date);
      if (!isNaN(d.getTime())) {
        const yy = String(d.getFullYear()).slice(2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        data.date = Number(`${yy}${mm}${dd}`);  // 🔥 YYMMDD 숫자로 저장
      }
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
