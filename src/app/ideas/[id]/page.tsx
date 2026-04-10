import { notFound } from "next/navigation";
import { getIdeaById } from "@/lib/db/queries";
import AnalysisView from "@/components/AnalysisView";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { IdeaDetail } from "@/types/analysis";

interface Props {
  params: { id: string };
}

export default async function IdeaDetailPage({ params }: Props) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const raw = await getIdeaById(id);
  if (!raw || !raw.stage1) notFound();

  const data: IdeaDetail = {
    idea: {
      ...raw.idea,
      created_at: raw.idea.created_at.toISOString(),
    },
    stage1: {
      ...raw.stage1,
      risk_factors: raw.stage1.risk_factors as string[],
    },
    stage2: raw.stage2.map((e) => ({
      ...e,
      magnitude: e.magnitude as "상" | "중" | "하",
    })),
    stage3: raw.stage3.map((c) => ({
      ...c,
      ticker: c.ticker ?? null,
      exchange: c.exchange ?? null,
      benefit_type: c.benefit_type as "직접수혜" | "간접수혜" | "공급망수혜",
      confidence: c.confidence as "높음" | "보통" | "낮음",
    })),
    keywords: raw.keywords,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href="/ideas">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
      </Link>
      <AnalysisView data={data} />
    </div>
  );
}
