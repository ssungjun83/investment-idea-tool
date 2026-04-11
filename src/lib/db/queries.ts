import { db } from "./index";
import {
  ideas,
  stage1Idea,
  stage2Effects,
  stage3Companies,
  keywords,
  ideaKeywords,
  keywordRelations,
  companyKeywords,
} from "./schema";
import { eq, desc, ilike, inArray, sql, and, or } from "drizzle-orm";
import type { AnalysisResult } from "@/types/analysis";
import type { CytoscapeElements } from "@/types/graph";

// ─── Save Analysis ───────────────────────────────────────────────────────────

export async function saveAnalysis(
  rawInput: string,
  analysis: AnalysisResult
): Promise<number> {
  const [idea] = await db
    .insert(ideas)
    .values({ raw_input: rawInput, title: analysis.title })
    .returning({ id: ideas.id });

  const ideaId = idea.id;

  await db.insert(stage1Idea).values({
    idea_id: ideaId,
    theme: analysis.stage1.theme,
    background: analysis.stage1.background,
    mechanism: analysis.stage1.mechanism,
    timeline: analysis.stage1.timeline,
    risk_factors: analysis.stage1.risk_factors,
  });

  if (analysis.stage2.length > 0) {
    await db.insert(stage2Effects).values(
      analysis.stage2.map((e) => ({
        idea_id: ideaId,
        effect_order: e.effect_order,
        category: e.category,
        description: e.description,
        magnitude: e.magnitude,
      }))
    );
  }

  if (analysis.stage3.length > 0) {
    await db.insert(stage3Companies).values(
      analysis.stage3.map((c) => ({
        idea_id: ideaId,
        company_name: c.company_name,
        ticker: c.ticker,
        exchange: c.exchange,
        sector: c.sector,
        reason: c.reason,
        benefit_type: c.benefit_type,
        confidence: c.confidence,
        moat_type: (c as any).moat_type ?? null,
        moat_reason: (c as any).moat_reason ?? null,
        asset_type: (c as any).asset_type ?? "기업",
      }))
    );
  }

  return ideaId;
}

// ─── Save Keywords ────────────────────────────────────────────────────────────

export async function saveKeywords(
  ideaId: number,
  kwList: { name: string; category: string }[]
): Promise<void> {
  if (kwList.length === 0) return;

  const savedKws: { id: number; name: string }[] = [];

  for (const kw of kwList) {
    const existing = await db
      .select({ id: keywords.id, name: keywords.name })
      .from(keywords)
      .where(ilike(keywords.name, kw.name))
      .limit(1);

    let kwId: number;
    if (existing.length > 0) {
      kwId = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(keywords)
        .values({ name: kw.name, category: kw.category })
        .returning({ id: keywords.id, name: keywords.name });
      kwId = inserted.id;
    }
    savedKws.push({ id: kwId, name: kw.name });

    // link idea ↔ keyword
    await db
      .insert(ideaKeywords)
      .values({ idea_id: ideaId, keyword_id: kwId, source: "ai", weight: 1.0 })
      .onConflictDoNothing();
  }

  // Build co-occurrence edges (all pairs)
  for (let i = 0; i < savedKws.length; i++) {
    for (let j = i + 1; j < savedKws.length; j++) {
      const aId = savedKws[i].id;
      const bId = savedKws[j].id;
      // Both directions for symmetric traversal
      await db
        .insert(keywordRelations)
        .values({ keyword_a_id: aId, keyword_b_id: bId, idea_id: ideaId, strength: 1.0 })
        .onConflictDoUpdate({
          target: [keywordRelations.keyword_a_id, keywordRelations.keyword_b_id, keywordRelations.idea_id],
          set: { strength: sql`${keywordRelations.strength} + 0.5` },
        });
      await db
        .insert(keywordRelations)
        .values({ keyword_a_id: bId, keyword_b_id: aId, idea_id: ideaId, strength: 1.0 })
        .onConflictDoUpdate({
          target: [keywordRelations.keyword_a_id, keywordRelations.keyword_b_id, keywordRelations.idea_id],
          set: { strength: sql`${keywordRelations.strength} + 0.5` },
        });
    }
  }

  // Link companies to matching keywords
  const companies = await db
    .select({ id: stage3Companies.id, company_name: stage3Companies.company_name, ticker: stage3Companies.ticker })
    .from(stage3Companies)
    .where(eq(stage3Companies.idea_id, ideaId));

  for (const company of companies) {
    const matchingKw = savedKws.find(
      (kw) =>
        kw.name.toLowerCase() === company.company_name.toLowerCase() ||
        (company.ticker && kw.name.toLowerCase() === company.ticker.toLowerCase())
    );
    if (matchingKw) {
      await db
        .insert(companyKeywords)
        .values({ company_id: company.id, keyword_id: matchingKw.id })
        .onConflictDoNothing();
    }
  }
}

// ─── Get Idea Detail ──────────────────────────────────────────────────────────

export async function getIdeaById(id: number) {
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
  if (!idea) return null;

  const [s1] = await db.select().from(stage1Idea).where(eq(stage1Idea.idea_id, id)).limit(1);
  const s2 = await db.select().from(stage2Effects).where(eq(stage2Effects.idea_id, id));
  const s3 = await db.select().from(stage3Companies).where(eq(stage3Companies.idea_id, id));
  const kws = await db
    .select({ id: keywords.id, name: keywords.name, category: keywords.category })
    .from(keywords)
    .innerJoin(ideaKeywords, eq(ideaKeywords.keyword_id, keywords.id))
    .where(eq(ideaKeywords.idea_id, id));

  return { idea, stage1: s1 || null, stage2: s2, stage3: s3, keywords: kws };
}

// ─── List Ideas ───────────────────────────────────────────────────────────────

export async function listIdeas(opts: {
  q?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  let query = db
    .select({
      id: ideas.id,
      title: ideas.title,
      raw_input: ideas.raw_input,
      created_at: ideas.created_at,
    })
    .from(ideas)
    .$dynamic();

  if (opts.q) {
    query = query.where(
      or(
        ilike(ideas.title, `%${opts.q}%`),
        ilike(ideas.raw_input, `%${opts.q}%`)
      )
    );
  }

  if (opts.keyword) {
    const kwRows = await db
      .select({ id: keywords.id })
      .from(keywords)
      .where(ilike(keywords.name, `%${opts.keyword}%`));
    if (kwRows.length > 0) {
      const kwIds = kwRows.map((r) => r.id);
      const ideaIds = await db
        .selectDistinct({ idea_id: ideaKeywords.idea_id })
        .from(ideaKeywords)
        .where(inArray(ideaKeywords.keyword_id, kwIds));
      if (ideaIds.length > 0) {
        query = query.where(inArray(ideas.id, ideaIds.map((r) => r.idea_id)));
      } else {
        return [];
      }
    }
  }

  const rows = await query.orderBy(desc(ideas.created_at)).limit(limit).offset(offset);

  // Attach keywords and company count per idea
  const result = await Promise.all(
    rows.map(async (row) => {
      const kws = await db
        .select({ name: keywords.name })
        .from(keywords)
        .innerJoin(ideaKeywords, eq(ideaKeywords.keyword_id, keywords.id))
        .where(eq(ideaKeywords.idea_id, row.id))
        .limit(10);

      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(stage3Companies)
        .where(eq(stage3Companies.idea_id, row.id));

      return {
        ...row,
        created_at: row.created_at.toISOString(),
        keywords: kws.map((k) => k.name),
        company_count: countRow?.count ?? 0,
      };
    })
  );

  return result;
}

// ─── All Keyword Names (for AI context) ───────────────────────────────────────

export async function getAllKeywordNames(): Promise<string[]> {
  const rows = await db
    .select({ name: keywords.name })
    .from(keywords)
    .orderBy(keywords.name)
    .limit(200);
  return rows.map((r) => r.name);
}

// ─── Find Related Ideas (by keyword overlap) ─────────────────────────────────

export async function findRelatedIdeas(ideaId: number, limit = 5) {
  // Get this idea's keywords
  const myKws = await db
    .select({ keyword_id: ideaKeywords.keyword_id })
    .from(ideaKeywords)
    .where(eq(ideaKeywords.idea_id, ideaId));

  if (myKws.length === 0) return [];

  const myKwIds = myKws.map((r) => r.keyword_id);

  // Find other ideas sharing these keywords, ranked by overlap count
  const related = await db
    .select({
      idea_id: ideaKeywords.idea_id,
      overlap: sql<number>`count(*)::int`,
    })
    .from(ideaKeywords)
    .where(
      and(
        inArray(ideaKeywords.keyword_id, myKwIds),
        sql`${ideaKeywords.idea_id} != ${ideaId}`
      )
    )
    .groupBy(ideaKeywords.idea_id)
    .orderBy(sql`count(*) DESC`)
    .limit(limit);

  if (related.length === 0) return [];

  const relatedIds = related.map((r) => r.idea_id);
  const overlapMap = new Map(related.map((r) => [r.idea_id, r.overlap]));

  const relatedIdeas = await db
    .select()
    .from(ideas)
    .where(inArray(ideas.id, relatedIds));

  // Attach overlap count and shared keywords
  const result = await Promise.all(
    relatedIdeas.map(async (idea) => {
      const sharedKws = await db
        .select({ name: keywords.name })
        .from(keywords)
        .innerJoin(ideaKeywords, eq(ideaKeywords.keyword_id, keywords.id))
        .where(
          and(
            eq(ideaKeywords.idea_id, idea.id),
            inArray(ideaKeywords.keyword_id, myKwIds)
          )
        );

      return {
        id: idea.id,
        title: idea.title,
        created_at: idea.created_at.toISOString(),
        overlap: overlapMap.get(idea.id) ?? 0,
        shared_keywords: sharedKws.map((k) => k.name),
      };
    })
  );

  return result.sort((a, b) => b.overlap - a.overlap);
}

// ─── Keyword Search ───────────────────────────────────────────────────────────

export async function searchKeywords(prefix: string, limit = 10) {
  return db
    .select({ id: keywords.id, name: keywords.name, category: keywords.category })
    .from(keywords)
    .where(ilike(keywords.name, `%${prefix}%`))
    .orderBy(keywords.name)
    .limit(limit);
}

// ─── Graph Data ───────────────────────────────────────────────────────────────

export async function getGraphForKeyword(keywordName: string): Promise<CytoscapeElements> {
  const [centerKw] = await db
    .select()
    .from(keywords)
    .where(ilike(keywords.name, keywordName))
    .limit(1);

  if (!centerKw) return { nodes: [], edges: [] };

  // Related keywords via co-occurrence
  const relations = await db
    .select({
      kwBId: keywordRelations.keyword_b_id,
      strength: keywordRelations.strength,
    })
    .from(keywordRelations)
    .where(eq(keywordRelations.keyword_a_id, centerKw.id));

  const relatedKwIds = Array.from(new Set(relations.map((r) => r.kwBId)));
  const relatedKws =
    relatedKwIds.length > 0
      ? await db.select().from(keywords).where(inArray(keywords.id, relatedKwIds))
      : [];

  // Ideas containing this keyword
  const linkedIdeas = await db
    .select({ idea_id: ideaKeywords.idea_id })
    .from(ideaKeywords)
    .where(eq(ideaKeywords.keyword_id, centerKw.id));

  const ideaIds = linkedIdeas.map((r) => r.idea_id);
  const linkedIdeaRows =
    ideaIds.length > 0
      ? await db.select().from(ideas).where(inArray(ideas.id, ideaIds))
      : [];

  // Companies from those ideas
  const companies =
    ideaIds.length > 0
      ? await db.select().from(stage3Companies).where(inArray(stage3Companies.idea_id, ideaIds))
      : [];

  // Build elements
  const nodes: CytoscapeElements["nodes"] = [
    {
      data: {
        id: `kw_${centerKw.id}`,
        type: "keyword",
        label: centerKw.name,
        category: centerKw.category,
        size: 40,
      },
    },
    ...relatedKws.map((kw) => ({
      data: {
        id: `kw_${kw.id}`,
        type: "keyword" as const,
        label: kw.name,
        category: kw.category,
        size: 24,
      },
    })),
    ...linkedIdeaRows.map((idea) => ({
      data: {
        id: `idea_${idea.id}`,
        type: "idea" as const,
        label: idea.title,
        ideaDate: idea.created_at.toISOString().split("T")[0],
        ideaId: idea.id,
        size: 28,
      },
    })),
    ...companies.map((co) => ({
      data: {
        id: `co_${co.id}`,
        type: "company" as const,
        label: co.ticker ? `${co.company_name} (${co.ticker})` : co.company_name,
        ticker: co.ticker ?? undefined,
        exchange: co.exchange ?? undefined,
        ideaId: co.idea_id,
        size: 22,
      },
    })),
  ];

  const edges: CytoscapeElements["edges"] = [
    ...relations.map((r) => ({
      data: {
        id: `e_kw_${centerKw.id}_${r.kwBId}`,
        source: `kw_${centerKw.id}`,
        target: `kw_${r.kwBId}`,
        edgeType: "keyword-keyword" as const,
        weight: Math.min(r.strength, 5),
      },
    })),
    ...linkedIdeaRows.map((idea) => ({
      data: {
        id: `e_idea_${idea.id}_kw_${centerKw.id}`,
        source: `idea_${idea.id}`,
        target: `kw_${centerKw.id}`,
        edgeType: "idea-keyword" as const,
        weight: 1,
      },
    })),
    ...companies.map((co) => ({
      data: {
        id: `e_co_${co.id}_idea_${co.idea_id}`,
        source: `co_${co.id}`,
        target: `idea_${co.idea_id}`,
        edgeType: "idea-company" as const,
        weight: 1,
      },
    })),
  ];

  return { nodes, edges };
}

export async function getFullGraph(): Promise<CytoscapeElements> {
  const allKws = await db.select().from(keywords).limit(100);
  const allRelations = await db
    .select()
    .from(keywordRelations)
    .orderBy(desc(keywordRelations.strength))
    .limit(300);

  const recentIdeas = await db
    .select()
    .from(ideas)
    .orderBy(desc(ideas.created_at))
    .limit(30);

  const ideaIds = recentIdeas.map((i) => i.id);
  const allLinks =
    ideaIds.length > 0
      ? await db.select().from(ideaKeywords).where(inArray(ideaKeywords.idea_id, ideaIds))
      : [];

  // Fetch companies for these ideas
  const companies =
    ideaIds.length > 0
      ? await db.select().from(stage3Companies).where(inArray(stage3Companies.idea_id, ideaIds))
      : [];

  // Fetch effects for these ideas
  const effects =
    ideaIds.length > 0
      ? await db.select().from(stage2Effects).where(inArray(stage2Effects.idea_id, ideaIds))
      : [];

  const nodes: CytoscapeElements["nodes"] = [
    ...allKws.map((kw) => ({
      data: {
        id: `kw_${kw.id}`,
        type: "keyword" as const,
        label: kw.name,
        category: kw.category,
        size: 20,
      },
    })),
    ...recentIdeas.map((idea) => ({
      data: {
        id: `idea_${idea.id}`,
        type: "idea" as const,
        label: idea.title,
        ideaDate: idea.created_at.toISOString().split("T")[0],
        ideaId: idea.id,
        size: 24,
      },
    })),
    ...companies.map((co) => ({
      data: {
        id: `co_${co.id}`,
        type: "company" as const,
        label: co.ticker ? `${co.company_name} (${co.ticker})` : co.company_name,
        ticker: co.ticker ?? undefined,
        exchange: co.exchange ?? undefined,
        ideaId: co.idea_id,
        size: 18,
      },
    })),
    ...effects.map((ef) => ({
      data: {
        id: `ef_${ef.id}`,
        type: "effect" as const,
        label: ef.description.length > 30 ? ef.description.slice(0, 30) + "…" : ef.description,
        ideaId: ef.idea_id,
        size: 16,
      },
    })),
  ];

  const edges: CytoscapeElements["edges"] = [
    ...allRelations.map((r) => ({
      data: {
        id: `e_${r.id}`,
        source: `kw_${r.keyword_a_id}`,
        target: `kw_${r.keyword_b_id}`,
        edgeType: "keyword-keyword" as const,
        weight: Math.min(r.strength, 5),
      },
    })),
    ...allLinks.map((link) => ({
      data: {
        id: `e_ik_${link.idea_id}_${link.keyword_id}`,
        source: `idea_${link.idea_id}`,
        target: `kw_${link.keyword_id}`,
        edgeType: "idea-keyword" as const,
        weight: link.weight,
      },
    })),
    ...companies.map((co) => ({
      data: {
        id: `e_co_${co.id}_idea_${co.idea_id}`,
        source: `co_${co.id}`,
        target: `idea_${co.idea_id}`,
        edgeType: "idea-company" as const,
        weight: 1,
      },
    })),
    ...effects.map((ef) => ({
      data: {
        id: `e_ef_${ef.id}_idea_${ef.idea_id}`,
        source: `ef_${ef.id}`,
        target: `idea_${ef.idea_id}`,
        edgeType: "idea-effect" as const,
        weight: 1,
      },
    })),
  ];

  return { nodes, edges };
}
