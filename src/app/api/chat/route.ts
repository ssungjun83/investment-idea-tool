import { NextRequest } from "next/server";
import { db } from "@/lib/db/index";
import { ideas, stage1Idea, stage2Effects, stage3Companies, keywords, ideaKeywords } from "@/lib/db/schema";
import { ilike, eq, inArray, desc, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "질문을 입력해주세요." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // 1. 질문에서 키워드 매칭하여 관련 데이터 수집
        const words = question.split(/[\s,]+/).filter((w: string) => w.length >= 2);

        // 키워드 검색
        let matchedKwIds: number[] = [];
        for (const word of words) {
          const kws = await db
            .select({ id: keywords.id })
            .from(keywords)
            .where(ilike(keywords.name, `%${word}%`))
            .limit(5);
          matchedKwIds.push(...kws.map((k) => k.id));
        }
        matchedKwIds = Array.from(new Set(matchedKwIds));

        // 관련 아이디어 찾기
        let relatedIdeaIds: number[] = [];
        if (matchedKwIds.length > 0) {
          const links = await db
            .selectDistinct({ idea_id: ideaKeywords.idea_id })
            .from(ideaKeywords)
            .where(inArray(ideaKeywords.keyword_id, matchedKwIds))
            .limit(10);
          relatedIdeaIds = links.map((l) => l.idea_id);
        }

        // 텍스트 검색 fallback
        if (relatedIdeaIds.length === 0) {
          for (const word of words) {
            const found = await db
              .select({ id: ideas.id })
              .from(ideas)
              .where(ilike(ideas.title, `%${word}%`))
              .limit(5);
            relatedIdeaIds.push(...found.map((f) => f.id));
          }
          relatedIdeaIds = Array.from(new Set(relatedIdeaIds));
        }

        // 관련 데이터 수집
        let context = "";

        if (relatedIdeaIds.length > 0) {
          const relatedIdeas = await db
            .select()
            .from(ideas)
            .where(inArray(ideas.id, relatedIdeaIds))
            .orderBy(desc(ideas.created_at))
            .limit(10);

          for (const idea of relatedIdeas) {
            const [s1] = await db.select().from(stage1Idea).where(eq(stage1Idea.idea_id, idea.id)).limit(1);
            const effects = await db.select().from(stage2Effects).where(eq(stage2Effects.idea_id, idea.id));
            const companies = await db.select().from(stage3Companies).where(eq(stage3Companies.idea_id, idea.id));

            context += `\n--- 아이디어: ${idea.title} (${idea.created_at.toISOString().split("T")[0]}) ---\n`;
            if (s1) {
              context += `테마: ${s1.theme}\n메커니즘: ${s1.mechanism}\n`;
            }
            if (effects.length > 0) {
              context += `사이드이펙트:\n${effects.map((e) => `- [${e.magnitude}] ${e.description}`).join("\n")}\n`;
            }
            if (companies.length > 0) {
              context += `수혜 기업:\n${companies.map((c) => `- ${c.company_name}(${c.ticker ?? "N/A"}, ${c.exchange ?? "N/A"}) [${c.benefit_type}, 확신도:${c.confidence}] — ${c.reason}`).join("\n")}\n`;
            }
          }
        }

        // 전체 기업 목록도 참고
        const allCompanies = await db
          .select({
            company_name: stage3Companies.company_name,
            ticker: stage3Companies.ticker,
            exchange: stage3Companies.exchange,
            sector: stage3Companies.sector,
            count: sql<number>`count(*)::int`,
          })
          .from(stage3Companies)
          .groupBy(stage3Companies.company_name, stage3Companies.ticker, stage3Companies.exchange, stage3Companies.sector)
          .orderBy(desc(sql`count(*)`))
          .limit(30);

        if (allCompanies.length > 0) {
          context += `\n--- 전체 기업 빈도 ---\n`;
          context += allCompanies.map((c) => `${c.company_name}(${c.ticker ?? "N/A"}) — ${c.count}회 언급`).join("\n");
        }

        if (!context.trim()) {
          context = "아직 축적된 데이터가 없습니다.";
        }

        // 2. Claude에 질문
        send({ type: "status", message: "데이터 분석 중..." });

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

        const client = new Anthropic({ apiKey });
        const aiStream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: `당신은 사용자의 투자 아이디어 데이터베이스를 기반으로 질문에 답하는 투자 어시스턴트입니다.
아래 데이터는 사용자가 축적한 투자 분석 자료입니다. 이 데이터를 기반으로 정확하고 구체적으로 답변하세요.
데이터에 없는 내용은 "축적된 데이터에는 해당 정보가 없습니다"라고 명확히 말하세요.
기업명에는 반드시 티커를 함께 표기하세요. 예: 삼성전자(005930.KS)
답변은 한국어로, 간결하게.

[축적된 데이터]
${context}`,
          messages: [{ role: "user", content: question }],
        });

        for await (const event of aiStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ type: "delta", text: event.delta.text });
          }
        }

        send({ type: "done" });
        controller.close();
      } catch (err) {
        console.error("[chat] error:", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "오류가 발생했습니다.",
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
