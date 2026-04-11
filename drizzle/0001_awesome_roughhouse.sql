CREATE TABLE "company_reports" (
	"company_id" integer NOT NULL,
	"report_id" integer NOT NULL,
	CONSTRAINT "company_reports_company_id_report_id_unique" UNIQUE("company_id","report_id")
);
--> statement-breakpoint
CREATE TABLE "indicator_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"indicator_id" integer NOT NULL,
	"date" text NOT NULL,
	"direction" text NOT NULL,
	"sentiment_score" integer NOT NULL,
	"summary" text NOT NULL,
	"forecast" text NOT NULL,
	"forecast_confidence" text,
	"news_items" jsonb NOT NULL,
	"user_ideas_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "indicator_snapshots_indicator_id_date_unique" UNIQUE("indicator_id","date")
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"category" text NOT NULL,
	"description" text,
	"search_queries" jsonb NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "indicators_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"ticker" text,
	"exchange" text,
	"summary" text NOT NULL,
	"key_points" jsonb NOT NULL,
	"risks" jsonb NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"page_count" integer,
	"source" text,
	"report_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "moat_type" text;--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "moat_reason" text;--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "asset_type" text DEFAULT '기업';--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "turnaround_stage" text;--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "turnaround_reason" text;--> statement-breakpoint
ALTER TABLE "stage3_companies" ADD COLUMN "name_ko" text;--> statement-breakpoint
ALTER TABLE "company_reports" ADD CONSTRAINT "company_reports_company_id_stage3_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."stage3_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_reports" ADD CONSTRAINT "company_reports_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_snapshots" ADD CONSTRAINT "indicator_snapshots_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "snapshot_indicator_idx" ON "indicator_snapshots" USING btree ("indicator_id");