import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // ✅ params는 Promise 형태
) {
  const { id } = await context.params; // ✅ await로 풀어야 함

  try {
    const docRef = doc(db, "purchases", id); // Firestore에서 문서 참조
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error("매입 상세 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
