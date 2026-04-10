CREATE TABLE "company_keywords" (
	"company_id" integer NOT NULL,
	"keyword_id" integer NOT NULL,
	CONSTRAINT "company_keywords_company_id_keyword_id_unique" UNIQUE("company_id","keyword_id")
);
--> statement-breakpoint
CREATE TABLE "idea_keywords" (
	"idea_id" integer NOT NULL,
	"keyword_id" integer NOT NULL,
	"source" text NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	CONSTRAINT "idea_keywords_idea_id_keyword_id_source_unique" UNIQUE("idea_id","keyword_id","source")
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_input" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword_a_id" integer NOT NULL,
	"keyword_b_id" integer NOT NULL,
	"idea_id" integer NOT NULL,
	"strength" real DEFAULT 1 NOT NULL,
	CONSTRAINT "keyword_relations_keyword_a_id_keyword_b_id_idea_id_unique" UNIQUE("keyword_a_id","keyword_b_id","idea_id")
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "keywords_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "stage1_idea" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"theme" text NOT NULL,
	"background" text NOT NULL,
	"mechanism" text NOT NULL,
	"timeline" text NOT NULL,
	"risk_factors" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage2_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"effect_order" integer NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"magnitude" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage3_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"ticker" text,
	"exchange" text,
	"sector" text NOT NULL,
	"reason" text NOT NULL,
	"benefit_type" text NOT NULL,
	"confidence" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_keywords" ADD CONSTRAINT "company_keywords_company_id_stage3_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."stage3_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_keywords" ADD CONSTRAINT "company_keywords_keyword_id_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_keywords" ADD CONSTRAINT "idea_keywords_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_keywords" ADD CONSTRAINT "idea_keywords_keyword_id_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_relations" ADD CONSTRAINT "keyword_relations_keyword_a_id_keywords_id_fk" FOREIGN KEY ("keyword_a_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_relations" ADD CONSTRAINT "keyword_relations_keyword_b_id_keywords_id_fk" FOREIGN KEY ("keyword_b_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_relations" ADD CONSTRAINT "keyword_relations_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage1_idea" ADD CONSTRAINT "stage1_idea_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage2_effects" ADD CONSTRAINT "stage2_effects_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD CONSTRAINT "stage3_companies_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idea_keywords_idea_idx" ON "idea_keywords" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "idea_keywords_kw_idx" ON "idea_keywords" USING btree ("keyword_id");