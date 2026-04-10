"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Stage1View from "./Stage1View";
import Stage2View from "./Stage2View";
import Stage3View from "./Stage3View";
import KeywordBadges from "./KeywordBadges";
import { Network } from "lucide-react";
import type { IdeaDetail } from "@/types/analysis";

export default function AnalysisView({ data }: { data: IdeaDetail }) {
  const router = useRouter();

  const topKeywords = data.keywords.slice(0, 5);
  const graphLink =
    topKeywords.length > 0
      ? `/graph?keyword=${encodeURIComponent(topKeywords[0].name)}`
      : "/graph";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.idea.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(data.idea.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push(graphLink)}
        >
          <Network className="h-4 w-4" />
          그래프에서 보기
        </Button>
      </div>

      {data.keywords.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">관련 키워드</p>
          <KeywordBadges keywords={data.keywords} />
        </div>
      )}

      <Tabs defaultValue="stage1">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="stage1" className="gap-1.5">
            💡 투자 아이디어
          </TabsTrigger>
          <TabsTrigger value="stage2" className="gap-1.5">
            🌊 사이드이펙트 <span className="text-xs opacity-70">({data.stage2.length})</span>
          </TabsTrigger>
          <TabsTrigger value="stage3" className="gap-1.5">
            🏢 수혜 기업 <span className="text-xs opacity-70">({data.stage3.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stage1" className="mt-4">
          {data.stage1 ? (
            <Stage1View data={data.stage1} />
          ) : (
            <p className="text-sm text-gray-500">데이터 없음</p>
          )}
        </TabsContent>

        <TabsContent value="stage2" className="mt-4">
          <Stage2View effects={data.stage2} />
        </TabsContent>

        <TabsContent value="stage3" className="mt-4">
          <Stage3View companies={data.stage3} />
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 font-medium mb-2">원본 입력</p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {data.idea.raw_input}
        </p>
      </div>
    </div>
  );
}
