"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Stage1View from "./Stage1View";
import Stage2View from "./Stage2View";
import Stage3View from "./Stage3View";
import KeywordBadges from "./KeywordBadges";
import { Network, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IdeaDetail, RelatedIdea } from "@/types/analysis";
import Link from "next/link";

interface Props {
  data: IdeaDetail;
  related?: RelatedIdea[];
}

export default function AnalysisView({ data, related }: Props) {
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

      {/* 연관 아이디어 */}
      {related && related.length > 0 && (
        <div className="border-t pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold text-gray-800">연관 아이디어</p>
            <span className="text-xs text-gray-400">키워드 겹침으로 자동 연결</span>
          </div>
          <div className="space-y-2">
            {related.map((r) => (
              <Link key={r.id} href={`/ideas/${r.id}`}>
                <Card className="hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {r.shared_keywords.slice(0, 5).map((kw, i) => (
                          <Badge key={i} variant="blue" className="text-xs py-0">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-bold text-blue-600">
                        {r.overlap}개 키워드 겹침
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 font-medium mb-2">원본 입력</p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {data.idea.raw_input}
        </p>
      </div>
    </div>
  );
}
