// /app/api/debug/route.ts
import { NextResponse } from "next/server";
import { getFirestoreSafe } from "@lib/firebaseAdmin"; // ✅ 안전한 Firestore 접근 함수 사용


export async function GET() {
  try {
    const db = getFirestoreSafe();
    if (!db) {
    // 🔒 Firebase 초기화 실패 시 안전하게 처리
    return NextResponse.json({ error: "Firestore 초기화 실패" }, { status: 500 });
  }
    const snapshot = await db.collection("purchases").get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ count: docs.length, docs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
