//api/clients/route.ts입니다

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "clients"));
    const clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(clients); // ✅ 반드시 배열 반환
  } catch (err) {
    console.error("Firestore 오류:", err);
    return NextResponse.json([], { status: 500 }); // ✅ 빈 배열이라도 반환
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json(); // 클라이언트에서 보낸 거래처 데이터
    const docRef = await addDoc(collection(db, "clients"), body);

    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (err) {
    console.error("거래처 등록 오류:", err);
    return NextResponse.json({ error: "거래처 등록 실패" }, { status: 500 });
  }
}