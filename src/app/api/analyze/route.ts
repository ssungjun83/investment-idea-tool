import { NextRequest } from "next/server";
import { streamAnalysis, extractKeywords } from "@/lib/ai/client";
import { parseAnalysisResponse } from "@/lib/ai/parser";
import { saveAnalysis, saveKeywords, getAllKeywordNames } from "@/lib/db/queries";

export const maxDuration = 300; // Vercel Pro: 5분, Free: 10초 제한
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { raw_input, image } = await req.json();

  if (!raw_input?.trim() && !image) {
    return new Response(
      JSON.stringify({ error: "투자 아이디어를 입력하거나 이미지를 첨부해주세요." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        // 기존 키워드 목록 가져오기 (AI에게 맥락 전달)
        let existingKeywords: string[] = [];
        try {
          existingKeywords = await getAllKeywordNames();
        } catch {
          // DB 연결 실패해도 분석은 계속 진행
        }

        const existingContext =
          existingKeywords.length > 0
            ? existingKeywords.join(", ")
            : undefined;

        // Stage 1: Stream Claude analysis (기존 키워드 맥락 포함)
        send({ type: "status", stage: 1, message: "투자 아이디어 분석 중..." });
        let accumulated = "";
        await streamAnalysis(
          raw_input || "첨부된 이미지를 분석해주세요.",
          (delta) => {
            accumulated += delta;
            send({ type: "delta", text: delta });
          },
          image ?? undefined,
          existingContext
        );

        // Stage 2: Parse
        send({ type: "status", stage: 2, message: "사이드이펙트 도출 중..." });
        const analysis = parseAnalysisResponse(accumulated);

        // Stage 3: Save to DB
        send({ type: "status", stage: 3, message: "데이터 저장 및 키워드 연결 중..." });
        const inputText = raw_input || "[이미지 분석]";
        const ideaId = await saveAnalysis(inputText, analysis);

        // 키워드 추출 (기존 키워드 목록 전달하여 재사용 유도)
        const kwList = await extractKeywords(accumulated, existingKeywords);
        await saveKeywords(ideaId, kwList);

        send({ type: "done", idea_id: ideaId });
        controller.close();
      } catch (err) {
        console.error("[analyze] error:", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
