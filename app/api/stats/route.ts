// app/api/stats/route.ts입니다 

import { NextResponse } from "next/server";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";

function parseDate(num: number) {
  const str = num.toString().padStart(6, "0");
  const year = 2000 + parseInt(str.slice(0, 2));
  const month = parseInt(str.slice(2, 4));
  const day = parseInt(str.slice(4, 6));
  return { year, month, day };
}

export async function GET() {
  try {
    console.log("📊 Stats API 호출됨");
    
    const db = getFirestoreSafe();

    const purchasesSnap = await db.collection("purchases").get();
    const salesSnap = await db.collection("sales").get();

    console.log(`✅ Purchases: ${purchasesSnap.size}개`);
    console.log(`✅ Sales: ${salesSnap.size}개`);

    const purchases = purchasesSnap.docs.map(doc => {
      const data = doc.data();
      const { year, month, day } = parseDate(data.date);
      const raw = typeof data.totalAmount === "number"
          ? data.totalAmount
          : Number(String(data.totalAmount).trim());
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        year,
        month,
        item: data.item || "",
        supplier: data.supplier || "",
        amount: Number.isNaN(raw) ? 0 : raw, // ✅ 음수도 그대로 반영
 
      };
      
    });

    const sales = salesSnap.docs.map(doc => {
      const data = doc.data();
      const { year, month, day } = parseDate(data.date);
      const raw = typeof data.totalAmount === "number"
          ? data.totalAmount
          : Number(String(data.totalAmount).trim());

         // console.log("📄 Purchase raw:", data.totalAmount, "→", raw);
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        year,
        month,
        item: data.item || "",
        buyer: data.buyer || "",
        amount: Number.isNaN(raw) ? 0 : raw, // ✅ 음수도 그대로 반영
        
      };
      
    });
    
    return NextResponse.json({ purchases, sales });
  } catch (error) {
    console.error("❌ Stats API 오류:", error);
    return NextResponse.json(
      { 
        error: "데이터를 불러오는 중 오류가 발생했습니다", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}