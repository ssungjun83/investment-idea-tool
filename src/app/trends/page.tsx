"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Sparkles, Hash, Loader2, Lightbulb, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TrendData {
  top_keywords: { id: number; name: string; category: string; idea_count: number }[];
  new_keywords: { id: number; name: string; category: string; created_at: string }[];
  stats: { total_ideas: number; total_keywords: number };
}

const categoryColors: Record<string, string> = {
  테마: "bg-purple-100 text-purple-700",
  섹터: "bg-blue-100 text-blue-700",
  회사: "bg-amber-100 text-amber-700",
  기술: "bg-emerald-100 text-emerald-700",
  지역: "bg-rose-100 text-rose-700",
  리스크: "bg-red-100 text-red-700",
};

export default function TrendsPage() {
  const router = useRouter();
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) return null;

  const maxCount = data.top_keywords[0]?.idea_count ?? 1;

  return (
    <div className="space-y-8">
      {/* Header + Stats */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-purple-500" />
        <h1 className="text-2xl font-bold">트렌드 보드</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold">{data.stats.total_ideas}</div>
            <div className="text-xs text-gray-400">총 아이디어</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Hash className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-2xl font-bold">{data.stats.total_keywords}</div>
            <div className="text-xs text-gray-400">총 키워드</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold">{data.top_keywords[0]?.idea_count ?? 0}</div>
            <div className="text-xs text-gray-400">최다 키워드 연결</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold">{data.new_keywords.length}</div>
            <div className="text-xs text-gray-400">최근 7일 신규</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-emerald-500" />
          키워드 랭킹 Top {data.top_keywords.length}
        </h2>
        <div className="space-y-2">
          {data.top_keywords.map((kw, i) => (
            <div
              key={kw.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:border-blue-200 cursor-pointer transition-colors"
              onClick={() => router.push(`/graph?keyword=${encodeURIComponent(kw.name)}`)}
            >
              <span className="text-sm font-bold text-gray-300 w-6 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{kw.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryColors[kw.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {kw.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(kw.idea_count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 w-12 text-right">
                  {kw.idea_count}개
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Keywords */}
      {data.new_keywords.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            최근 등장한 키워드
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.new_keywords.map((kw) => (
              <Badge
                key={kw.id}
                variant="green"
                className="cursor-pointer hover:opacity-80 transition-opacity gap-1"
                onClick={() => router.push(`/graph?keyword=${encodeURIComponent(kw.name)}`)}
              >
                <Tag className="h-3 w-3" />
                {kw.name}
                <span className="opacity-50 text-xs">
                  {new Date(kw.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
