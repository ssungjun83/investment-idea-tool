import { NextRequest, NextResponse } from "next/server";
import { listIdeas } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const keyword = searchParams.get("keyword") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const ideas = await listIdeas({ q, keyword, limit, offset });
    return NextResponse.json(ideas);
  } catch (err) {
    console.error("[ideas] error:", err);
    return NextResponse.json({ error: "목록 조회 실패" }, { status: 500 });
  }
}
