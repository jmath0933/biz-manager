import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params; // ✅ await 제거!

  try {
    const docRef = doc(db, "purchases", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "매입 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("매입 상세 조회 오류:", error);
    return NextResponse.json({ error: "매입 상세 조회 실패" }, { status: 500 });
  }
}
