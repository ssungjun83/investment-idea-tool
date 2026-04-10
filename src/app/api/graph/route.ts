import { NextRequest, NextResponse } from "next/server";
import { getGraphForKeyword, getFullGraph } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");

  try {
    const elements = keyword
      ? await getGraphForKeyword(keyword)
      : await getFullGraph();
    return NextResponse.json(elements);
  } catch (err) {
    console.error("[graph] error:", err);
    return NextResponse.json({ nodes: [], edges: [] }, { status: 500 });
  }
}
