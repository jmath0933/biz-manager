import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // ✅ PDF를 base64로 변환
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // ✅ AI 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "너는 세금계산서 PDF를 분석해서 날짜, 공급자, 수요자, 품목, 규격, 단가, 수량, 공급가액, 세액, 합계금액을 JSON 형식으로 추출하는 전문가야. 누락된 항목은 빈 문자열로 채워.",
        },
        {
          role: "user",
          content: `
다음은 base64 인코딩된 PDF 파일입니다.
텍스트를 추출한 후, 다음 항목을 JSON 형태로 추출해줘:
[발행일자, 공급자, 수요자, 품목, 규격, 단가, 수량, 공급가액, 세액, 합계금액]

PDF (base64):
${base64}
          `,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ data: parsed });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
