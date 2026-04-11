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
