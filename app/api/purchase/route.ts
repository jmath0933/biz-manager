import { NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin"; // ✅ 안전한 Firestore 접근 함수 사용

// ✅ 숫자 YYMMDD → 실제 Date로 변환
function parseYYMMDD(num: number) {
  if (!num) return null;
  const str = String(num).padStart(6, "0"); // 251104 → "251104"
  const yy = Number("20" + str.slice(0, 2)); // 25 → 2025
  const mm = Number(str.slice(2, 4)) - 1;    // 11 → 10(index)
  const dd = Number(str.slice(4, 6));        // 04 → 4
  return new Date(yy, mm, dd);
}

// ✅ 날짜 포맷 함수 (yy-mm-dd)
// ※ 구조/변수명/내용 변경 금지 요청 → 그대로 유지
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

// ✅ 매입 목록 조회 (GET /api/purchase)
export async function GET() {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const snapshot = await db!.collection("purchases").orderBy("date", "desc").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();

      // 🔥 핵심 추가: Firestore에 숫자로 저장된 날짜를 Date로 변환
      const parsedDate =
        typeof d.date === "number" ? parseYYMMDD(d.date) : d.date;

      return {
        id: doc.id,
        date: formatDate(parsedDate), // ← 기존 구조 그대로 유지하며 변환 적용
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

// ✅ 매입 등록 (POST /api/purchase)
export async function POST(request: Request) {
  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }

  try {
    const data = await request.json();

    // 문자열 날짜를 Firestore용 Date로 변환 (기존 코드 유지)
    if (typeof data.date === "string" && !isNaN(Date.parse(data.date))) {
      data.date = new Date(data.date);
    }

    const docRef = await db!.collection("purchases").add(data);
    return NextResponse.json({ id: docRef.id, message: "등록되었습니다." });
  } catch (error: any) {
    console.error("🔥 매입 등록 오류:", error);
    return NextResponse.json(
      { error: error.message || "등록 중 오류 발생" },
      { status: 500 }
    );
  }
}
