import { NextRequest } from "next/server";
import { streamAnalysis, extractKeywords } from "@/lib/ai/client";
import { parseAnalysisResponse } from "@/lib/ai/parser";
import { saveAnalysis, saveKeywords } from "@/lib/db/queries";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { raw_input } = await req.json();

  if (!raw_input?.trim()) {
    return new Response(
      JSON.stringify({ error: "투자 아이디어를 입력해주세요." }),
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
        // Stage 1: Stream Claude analysis
        send({ type: "status", stage: 1, message: "투자 아이디어 분석 중..." });
        let accumulated = "";
        await streamAnalysis(raw_input, (delta) => {
          accumulated += delta;
          send({ type: "delta", text: delta });
        });

        // Stage 2: Parse
        send({ type: "status", stage: 2, message: "사이드이펙트 도출 중..." });
        const analysis = parseAnalysisResponse(accumulated);

        // Stage 3: Save to DB
        send({ type: "status", stage: 3, message: "수혜 기업 저장 중..." });
        const ideaId = await saveAnalysis(raw_input, analysis);

        // Extract and save keywords
        const kwList = await extractKeywords(accumulated);
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
