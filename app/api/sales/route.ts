import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// ✅ 매출 목록 조회 (GET /api/sales)
export async function GET() {
  try {
    const q = query(collection(db, "sales"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("매출 목록 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}

// ✅ 매출 등록 (POST /api/sales)
export async function POST(request: Request) {
  const data = await request.json();

  try {
    const docRef = await addDoc(collection(db, "sales"), data);
    return NextResponse.json({ id: docRef.id, message: "등록되었습니다." });
  } catch (error) {
    console.error("매출 등록 오류:", error);
    return NextResponse.json({ error: "등록 중 오류 발생" }, { status: 500 });
  }
}
