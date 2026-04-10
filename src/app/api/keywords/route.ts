import { NextRequest, NextResponse } from "next/server";
import { searchKeywords } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  try {
    const results = await searchKeywords(q, 10);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[keywords] error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
