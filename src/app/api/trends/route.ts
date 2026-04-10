import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { keywords, ideaKeywords, ideas } from "@/lib/db/schema";
import { eq, desc, sql, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Top 키워드: 아이디어 연결 수 기준
    const topKeywords = await db
      .select({
        id: keywords.id,
        name: keywords.name,
        category: keywords.category,
        idea_count: sql<number>`count(DISTINCT ${ideaKeywords.idea_id})::int`,
      })
      .from(keywords)
      .leftJoin(ideaKeywords, eq(ideaKeywords.keyword_id, keywords.id))
      .groupBy(keywords.id, keywords.name, keywords.category)
      .orderBy(desc(sql`count(DISTINCT ${ideaKeywords.idea_id})`))
      .limit(20);

    // 최근 7일 내 새로 추가된 키워드
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newKeywords = await db
      .select({
        id: keywords.id,
        name: keywords.name,
        category: keywords.category,
        created_at: keywords.created_at,
      })
      .from(keywords)
      .where(gte(keywords.created_at, sevenDaysAgo))
      .orderBy(desc(keywords.created_at))
      .limit(20);

    // 최근 아이디어 수 (전체)
    const [totalIdeas] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ideas);

    const [totalKeywords] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(keywords);

    return NextResponse.json({
      top_keywords: topKeywords,
      new_keywords: newKeywords,
      stats: {
        total_ideas: totalIdeas?.count ?? 0,
        total_keywords: totalKeywords?.count ?? 0,
      },
    });
  } catch (err) {
    console.error("[trends] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
