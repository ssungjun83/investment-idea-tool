import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  raw_input: text("raw_input").notNull(),
  title: text("title").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const stage1Idea = pgTable("stage1_idea", {
  id: serial("id").primaryKey(),
  idea_id: integer("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  theme: text("theme").notNull(),
  background: text("background").notNull(),
  mechanism: text("mechanism").notNull(),
  timeline: text("timeline").notNull(),
  risk_factors: jsonb("risk_factors").notNull().$type<string[]>(),
});

export const stage2Effects = pgTable("stage2_effects", {
  id: serial("id").primaryKey(),
  idea_id: integer("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  effect_order: integer("effect_order").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  magnitude: text("magnitude").notNull(),
});

export const stage3Companies = pgTable("stage3_companies", {
  id: serial("id").primaryKey(),
  idea_id: integer("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  company_name: text("company_name").notNull(),
  ticker: text("ticker"),
  exchange: text("exchange"),
  sector: text("sector").notNull(),
  reason: text("reason").notNull(),
  benefit_type: text("benefit_type").notNull(),
  confidence: text("confidence").notNull(),
  moat_type: text("moat_type"),
  moat_reason: text("moat_reason"),
  asset_type: text("asset_type").default("기업"),
  turnaround_stage: text("turnaround_stage"),
  turnaround_reason: text("turnaround_reason"),
  name_ko: text("name_ko"),
});

export const keywords = pgTable(
  "keywords",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    category: text("category").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  }
);

export const ideaKeywords = pgTable(
  "idea_keywords",
  {
    idea_id: integer("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    keyword_id: integer("keyword_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    weight: real("weight").notNull().default(1.0),
  },
  (t) => ({
    pk: unique().on(t.idea_id, t.keyword_id, t.source),
    ideaIdx: index("idea_keywords_idea_idx").on(t.idea_id),
    kwIdx: index("idea_keywords_kw_idx").on(t.keyword_id),
  })
);

export const keywordRelations = pgTable(
  "keyword_relations",
  {
    id: serial("id").primaryKey(),
    keyword_a_id: integer("keyword_a_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
    keyword_b_id: integer("keyword_b_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
    idea_id: integer("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    strength: real("strength").notNull().default(1.0),
  },
  (t) => ({
    uniq: unique().on(t.keyword_a_id, t.keyword_b_id, t.idea_id),
  })
);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company_name: text("company_name").notNull(),
  ticker: text("ticker"),
  exchange: text("exchange"),
  summary: text("summary").notNull(),
  key_points: jsonb("key_points").notNull().$type<string[]>(),
  risks: jsonb("risks").notNull().$type<string[]>(),
  file_name: text("file_name").notNull(),
  file_path: text("file_path").notNull(),
  page_count: integer("page_count"),
  source: text("source"),
  report_date: text("report_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const companyReports = pgTable(
  "company_reports",
  {
    company_id: integer("company_id")
      .notNull()
      .references(() => stage3Companies.id, { onDelete: "cascade" }),
    report_id: integer("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: unique().on(t.company_id, t.report_id),
  })
);

// ─── 핵심지표 모니터링 ─────────────────────────────────────────────────────

export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  name_en: text("name_en"),
  category: text("category").notNull(), // 원자재, 금리, 운임, 환율, 산업
  description: text("description"),
  search_queries: jsonb("search_queries").notNull().$type<string[]>(), // Google News 검색어들
  yahoo_symbol: text("yahoo_symbol"), // Yahoo Finance 심볼 (CL=F, ^TNX 등)
  value_unit: text("value_unit"), // 단위 (USD/bbl, %, 포인트 등)
  is_active: integer("is_active").notNull().default(1),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const indicatorSnapshots = pgTable(
  "indicator_snapshots",
  {
    id: serial("id").primaryKey(),
    indicator_id: integer("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    direction: text("direction").notNull(), // up, down, neutral
    sentiment_score: integer("sentiment_score").notNull(), // -100 ~ 100
    summary: text("summary").notNull(),
    forecast: text("forecast").notNull(),
    forecast_confidence: text("forecast_confidence"), // 높음, 보통, 낮음
    current_value: real("current_value"), // 실제 수치 (가격, 금리 등)
    previous_close: real("previous_close"), // 전일 종가
    value_change: real("value_change"), // 변동폭
    value_change_pct: real("value_change_pct"), // 변동률 (%)
    day_high: real("day_high"),
    day_low: real("day_low"),
    news_items: jsonb("news_items").notNull().$type<{ title: string; source: string; url: string; date: string }[]>(),
    user_ideas_context: text("user_ideas_context"), // 반영된 사용자 아이디어 요약
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqDate: unique().on(t.indicator_id, t.date),
    indicatorIdx: index("snapshot_indicator_idx").on(t.indicator_id),
  })
);

// ─── 박살기업 스캔 ──────────────────────────────────────────────────────

export const crushedScans = pgTable("crushed_scans", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  sectors: jsonb("sectors").notNull().$type<CrushedSector[]>(),
  total_stocks: integer("total_stocks").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export interface CrushedStock {
  ticker: string;
  name: string;
  exchange: string;
  current_price: number;
  week52_low: number;
  week52_high: number;
  off_from_high_pct: number; // 고점 대비 하락률
  near_low_pct: number; // 52주 저가 대비 (낮을수록 바닥)
  volume: number;
  market_cap: number | null;
  ai_comment: string;
  recovery_potential: "높음" | "보통" | "낮음";
}

export interface CrushedSector {
  sector: string;
  sector_en: string;
  etf_ticker: string;
  etf_price: number | null;
  etf_off_high_pct: number | null;
  stocks: CrushedStock[];
  ai_summary: string;
}

export const companyKeywords = pgTable(
  "company_keywords",
  {
    company_id: integer("company_id")
      .notNull()
      .references(() => stage3Companies.id, { onDelete: "cascade" }),
    keyword_id: integer("keyword_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: unique().on(t.company_id, t.keyword_id),
  })
);
