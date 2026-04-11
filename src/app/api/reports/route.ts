import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { reports, companyReports, stage3Companies } from "@/lib/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const ticker = searchParams.get("ticker") ?? undefined;

  try {
    let query = db.select().from(reports).$dynamic();

    if (q) {
      query = query.where(
        or(
          ilike(reports.title, `%${q}%`),
          ilike(reports.company_name, `%${q}%`),
          ilike(reports.ticker, `%${q}%`),
          ilike(reports.summary, `%${q}%`)
        )
      );
    }

    if (ticker) {
      query = query.where(ilike(reports.ticker, ticker));
    }

    const rows = await query.orderBy(desc(reports.created_at));

    // Attach linked company IDs for each report
    const result = await Promise.all(
      rows.map(async (report) => {
        const links = await db
          .select({
            company_id: companyReports.company_id,
            company_name: stage3Companies.company_name,
            ticker: stage3Companies.ticker,
          })
          .from(companyReports)
          .innerJoin(stage3Companies, eq(stage3Companies.id, companyReports.company_id))
          .where(eq(companyReports.report_id, report.id));

        return {
          ...report,
          created_at: report.created_at.toISOString(),
          linked_companies: links,
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[reports] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
