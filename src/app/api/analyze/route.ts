import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/ai/client";
import { getAllKeywordNames } from "@/lib/db/queries";

// Edge Runtime: 스트리밍 중에는 타임아웃 없음 (무료 플랜 OK)
export const runtime = "edge";

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

        // 기존 키워드 목록을 클라이언트에 전달 (저장 단계에서 사용)
        send({ type: "existing_keywords", keywords: existingKeywords });

        // Stage 1: Stream Claude analysis
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

        // 분석 완료 — 원문 JSON을 클라이언트에 전달
        send({ type: "analysis_complete", raw_json: accumulated });
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
