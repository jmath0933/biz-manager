import { NextRequest, NextResponse } from "next/server";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";

// 날짜 문자열을 YYMMDD 숫자로 변환
function dateStrToNumber(dateStr: string): number {
  // "2025-10-17" → 251017
  const [year, month, day] = dateStr.split("-");
  const yy = year.slice(2); // "25"
  return parseInt(`${yy}${month}${day}`);
}

export async function GET(request: NextRequest) {
  console.log("📡 [API] GET /api/purchases 호출됨");
  
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start"); // "2025-10-17"
  const end = searchParams.get("end");     // "2025-11-16"

  console.log("📅 조회 기간:", { start, end });

  const db = getFirestoreSafe();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore 초기화 실패" },
      { status: 500 }
    );
  }

  try {
    // 날짜 범위 변환
    const startDate = start ? dateStrToNumber(start) : 0;
    const endDate = end ? dateStrToNumber(end) : 999999;

    console.log("🔢 날짜 범위 (숫자):", { startDate, endDate });

    // Firestore 쿼리
    const snapshot = await db
      .collection("purchases")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "desc")
      .get();

    console.log(`📊 조회된 문서 수: ${snapshot.size}개`);

    const purchases = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        
        // fileUrl이 없는 데이터는 제외
        if (!data.fileUrl || data.fileUrl.trim() === "") {
          console.log(`⚠️ fileUrl 없음 - 문서 ID: ${doc.id} 제외`);
          return null;
        }

        return {
          id: doc.id,
          date: data.date || 0,
          item: data.item || "",
          totalAmount: data.totalAmount || 0,
          supplier: data.supplier || "",
          supplierBiz: data.supplierBiz || "",
          supplyValue: data.supplyValue || 0,
          tax: data.tax || 0,
          fileUrl: data.fileUrl || "",
          filePath: data.filePath || "",
          createdAt: data.createdAt || null,
        };
      })
      .filter((p) => p !== null); // null 제거

    console.log(`✅ 유효한 매입 데이터: ${purchases.length}개`);
    
    // 샘플 데이터 로그
    if (purchases.length > 0) {
      console.log("📄 첫 번째 데이터 샘플:", purchases[0]);
    }

    return NextResponse.json({
      purchases,
      count: purchases.length,
      query: { start, end, startDate, endDate },
    });
  } catch (error: any) {
    console.error("❌ GET purchases error:", error);
    return NextResponse.json(
      { error: "매입 데이터 조회 실패: " + error.message },
      { status: 500 }
    );
  }
}