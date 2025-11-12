import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { extractedText } = await req.json();

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const apiVersion = "2023-05-15";

  const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;

  const prompt = `
다음은 세금계산서 텍스트입니다. 각 문서에서 다음 항목을 JSON 배열로 추출해줘:
[작성일자, 공급자, 수요자, 품목, 규격, 단가, 수량, 공급가액, 세액, 합계금액]
누락된 항목은 빈 문자열로 채워줘.

텍스트:
${extractedText}
`;

  const payload = {
    messages: [
      { role: "system", content: "너는 세금계산서를 분석하는 전문가야." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 2000
  };

  try {
    
    interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

const response = await axios.post<OpenAIResponse>(url, payload, {
  headers: {
    "Content-Type": "application/json",
    "api-key": apiKey
  },
  timeout: 30000
});

const result = response.data.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Azure OpenAI 호출 오류:", error.response?.data || error.message);
    return NextResponse.json({ error: "OpenAI 호출 실패" }, { status: 500 });
  }
}
