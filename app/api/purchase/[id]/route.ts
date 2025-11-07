import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    // purchase 컬렉션에서 id가 일치하는 문서 검색
    const q = query(collection(db, "purchases"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
    }

    // Firestore에서는 여러 문서를 반환할 수 있으므로 첫 번째만 사용
    const purchase = querySnapshot.docs[0].data();

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("매입 상세 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
