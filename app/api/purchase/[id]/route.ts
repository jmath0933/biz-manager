import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // ✅ Promise 아님!
) {
  const { id } = params; // ✅ await 제거

  try {
    const docRef = doc(db, "purchases", id); // ✅ Firestore 컬렉션 이름
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "매입 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error("매입 상세 조회 오류:", error);
    return NextResponse.json({ error: "매입 상세 조회 실패" }, { status: 500 });
  }
}
