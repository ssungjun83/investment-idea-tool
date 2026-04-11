import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { stage3Companies, ideas } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 기업별 원시 데이터 가져오기 (아이디어 날짜 포함)
    const rows = await db
      .select({
        company_name: stage3Companies.company_name,
        ticker: stage3Companies.ticker,
        exchange: stage3Companies.exchange,
        sector: stage3Companies.sector,
        benefit_type: stage3Companies.benefit_type,
        confidence: stage3Companies.confidence,
        reason: stage3Companies.reason,
        idea_id: stage3Companies.idea_id,
        idea_title: ideas.title,
        idea_date: ideas.created_at,
        moat_type: stage3Companies.moat_type,
        moat_reason: stage3Companies.moat_reason,
        asset_type: stage3Companies.asset_type,
        turnaround_stage: stage3Companies.turnaround_stage,
        turnaround_reason: stage3Companies.turnaround_reason,
      })
      .from(stage3Companies)
      .innerJoin(ideas, eq(ideas.id, stage3Companies.idea_id));

    // 기업별 집계 + 투자 점수 계산
    const companyMap = new Map<string, {
      company_name: string;
      ticker: string | null;
      exchange: string | null;
      sector: string;
      asset_type: string;
      score: number;
      mention_count: number;
      reasons: string[];
      benefit_types: Set<string>;
      confidences: string[];
      moat_types: string[];
      moat_reasons: string[];
      turnaround_stages: string[];
      turnaround_reasons: string[];
      ideas: { id: number; title: string; date: string }[];
      latest_date: Date;
    }>();

    const now = Date.now();

    for (const row of rows) {
      // 키: ticker 우선, 없으면 company_name
      const key = (row.ticker ?? row.company_name).toLowerCase();

      if (!companyMap.has(key)) {
        companyMap.set(key, {
          company_name: row.company_name,
          ticker: row.ticker,
          exchange: row.exchange,
          sector: row.sector,
          asset_type: row.asset_type ?? "기업",
          score: 0,
          mention_count: 0,
          reasons: [],
          benefit_types: new Set(),
          confidences: [],
          moat_types: [],
          moat_reasons: [],
          turnaround_stages: [],
          turnaround_reasons: [],
          ideas: [],
          latest_date: new Date(0),
        });
      }

      const co = companyMap.get(key)!;

      // ── 투자 점수 계산 ──
      // 1. 최신성: 7일=3x, 30일=2x, 이전=1x
      const daysDiff = (now - row.idea_date.getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = daysDiff <= 7 ? 3 : daysDiff <= 30 ? 2 : 1;

      // 2. 수혜 유형: 수혜는 +, 피해는 -
      const benefitWeight =
        row.benefit_type === "직접수혜" ? 3 :
        row.benefit_type === "간접수혜" ? 1.5 :
        row.benefit_type === "공급망수혜" ? 1 :
        row.benefit_type === "직접피해" ? -3 :
        row.benefit_type === "간접피해" ? -1.5 : 0.5;

      // 3. 확신도
      const confidenceWeight =
        row.confidence === "높음" ? 3 :
        row.confidence === "보통" ? 1.5 :
        row.confidence === "낮음" ? 0.5 : 1;

      // 4. 경제적 해자 가점: 넓은 해자 기업은 투자 매력도 상승
      const moatWeight =
        row.moat_type === "넓음" ? 2 :
        row.moat_type === "보통" ? 1.3 :
        row.moat_type === "좁음" ? 0.8 : 1;

      // 5. 턴어라운드 가점: 바닥에서 반등 잠재력이 큰 기업
      const turnaroundWeight =
        row.turnaround_stage === "역발상" ? 2.5 :
        row.turnaround_stage === "회복초기" ? 1.8 : 1;

      const mentionScore = recencyWeight * benefitWeight * confidenceWeight * moatWeight * turnaroundWeight;
      co.score += mentionScore;
      co.mention_count++;
      co.benefit_types.add(row.benefit_type);
      co.confidences.push(row.confidence);
      if (row.moat_type) co.moat_types.push(row.moat_type);
      if (row.moat_reason && !co.moat_reasons.includes(row.moat_reason)) {
        co.moat_reasons.push(row.moat_reason);
      }
      if (row.turnaround_stage) co.turnaround_stages.push(row.turnaround_stage);
      if (row.turnaround_reason && !co.turnaround_reasons.includes(row.turnaround_reason)) {
        co.turnaround_reasons.push(row.turnaround_reason);
      }

      if (row.reason && !co.reasons.includes(row.reason)) {
        co.reasons.push(row.reason);
      }

      // 아이디어 중복 방지
      if (!co.ideas.find((i) => i.id === row.idea_id)) {
        co.ideas.push({
          id: row.idea_id,
          title: row.idea_title,
          date: row.idea_date.toISOString().split("T")[0],
        });
      }

      if (row.idea_date > co.latest_date) {
        co.latest_date = row.idea_date;
      }
    }

    // 정렬: 투자 점수 기준 (높을수록 지금 투자해야 할 기업)
    const result = Array.from(companyMap.values())
      .map((co) => {
        // 평균 확신도 계산
        const avgConf = co.confidences.reduce((sum, c) =>
          sum + (c === "높음" ? 3 : c === "보통" ? 2 : 1), 0) / co.confidences.length;

        // 대표 해자 등급 (가장 높은 것)
        const moatOrder = { "넓음": 3, "보통": 2, "좁음": 1 };
        const bestMoat = co.moat_types.length > 0
          ? co.moat_types.reduce((best, m) =>
              (moatOrder[m as keyof typeof moatOrder] ?? 0) > (moatOrder[best as keyof typeof moatOrder] ?? 0) ? m : best
            )
          : null;

        return {
          company_name: co.company_name,
          ticker: co.ticker,
          exchange: co.exchange,
          sector: co.sector,
          asset_type: co.asset_type,
          score: Math.round(co.score * 10) / 10,
          mention_count: co.mention_count,
          confidence_label: avgConf >= 2.5 ? "높음" : avgConf >= 1.5 ? "보통" : "낮음",
          benefit_types: Array.from(co.benefit_types).join(", "),
          top_reason: co.reasons[co.reasons.length - 1] ?? "",
          moat_type: bestMoat,
          moat_reason: co.moat_reasons[0] ?? null,
          turnaround_stage: co.turnaround_stages.includes("역발상") ? "역발상"
            : co.turnaround_stages.includes("회복초기") ? "회복초기"
            : null,
          turnaround_reason: co.turnaround_reasons[0] ?? null,
          ideas: co.ideas.sort((a, b) => b.date.localeCompare(a.date)),
          latest_date: co.latest_date.toISOString().split("T")[0],
          days_ago: Math.floor((now - co.latest_date.getTime()) / (1000 * 60 * 60 * 24)),
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[companies] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
