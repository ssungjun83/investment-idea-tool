import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { crushedScans } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [latest] = await db
      .select()
      .from(crushedScans)
      .orderBy(desc(crushedScans.date))
      .limit(1);

    if (!latest) {
      return NextResponse.json({ date: null, sectors: [], total_stocks: 0 });
    }

    return NextResponse.json(latest);
  } catch (err) {
    console.error("[crushed] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
