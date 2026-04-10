import { NextRequest, NextResponse } from "next/server";
import { extractKeywords } from "@/lib/ai/client";
import { parseAnalysisResponse } from "@/lib/ai/parser";
import { saveAnalysis, saveKeywords } from "@/lib/db/queries";

// Serverless: DB 저장 + 키워드 추출 (10초 이내 완료)
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const { raw_input, raw_json, existing_keywords } = await req.json();

    if (!raw_json) {
      return NextResponse.json({ error: "분석 데이터가 없습니다." }, { status: 400 });
    }

    // Parse the analysis JSON
    const analysis = parseAnalysisResponse(raw_json);

    // Save to DB
    const inputText = raw_input || "[이미지 분석]";
    const ideaId = await saveAnalysis(inputText, analysis);

    // Extract keywords with Haiku + save
    const kwList = await extractKeywords(raw_json, existing_keywords ?? []);
    await saveKeywords(ideaId, kwList);

    return NextResponse.json({ idea_id: ideaId });
  } catch (err) {
    console.error("[analyze/save] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
