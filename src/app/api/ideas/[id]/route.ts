import { NextRequest, NextResponse } from "next/server";
import { getIdeaById, findRelatedIdeas } from "@/lib/db/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
  }

  try {
    const data = await getIdeaById(id);
    if (!data) {
      return NextResponse.json({ error: "아이디어를 찾을 수 없습니다." }, { status: 404 });
    }

    const related = await findRelatedIdeas(id, 5);

    return NextResponse.json({
      ...data,
      idea: {
        ...data.idea,
        created_at: data.idea.created_at.toISOString(),
      },
      related,
    });
  } catch (err) {
    console.error("[ideas/id] error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
