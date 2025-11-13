import { db } from "@lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      projectId: process.env.FIREBASE_PROJECT_ID,
      hasDb: db !== null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
