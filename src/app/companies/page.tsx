"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Loader2, Flame, Clock, TrendingUp, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyData {
  company_name: string;
  ticker: string | null;
  exchange: string | null;
  sector: string;
  score: number;
  mention_count: number;
  confidence_label: string;
  benefit_types: string;
  top_reason: string;
  ideas: { id: number; title: string; date: string }[];
  latest_date: string;
  days_ago: number;
}

interface SectorGroup {
  sector: string;
  companies: CompanyData[];
  topScore: number;
  totalScore: number;
  count: number;
}

const confidenceColors = {
  높음: "bg-emerald-50 text-emerald-700 border-emerald-200",
  보통: "bg-amber-50 text-amber-700 border-amber-200",
  낮음: "bg-gray-50 text-gray-500 border-gray-200",
};

const sectorColors: Record<string, string> = {
  강관: "border-l-red-500 bg-red-50/30",
  "OCTG 강관 제조": "border-l-red-500 bg-red-50/30",
  정유: "border-l-amber-500 bg-amber-50/30",
  항공: "border-l-sky-500 bg-sky-50/30",
  시추서비스: "border-l-orange-500 bg-orange-50/30",
  철강: "border-l-slate-500 bg-slate-50/30",
  화학: "border-l-purple-500 bg-purple-50/30",
  해운: "border-l-blue-500 bg-blue-50/30",
  에너지: "border-l-green-500 bg-green-50/30",
};

function getSectorColor(sector: string) {
  return sectorColors[sector] ?? "border-l-gray-400 bg-gray-50/30";
}

function ScoreBadge({ score, globalRank }: { score: number; globalRank: number }) {
  const color =
    score < 0 ? "bg-red-100 text-red-600 border border-red-200" :
    globalRank <= 3 ? "bg-red-500 text-white" :
    globalRank <= 6 ? "bg-orange-500 text-white" :
    "bg-gray-200 text-gray-600";

  return (
    <div className="text-center">
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${color}`}>
        {score >= 0 && globalRank <= 3 && <Flame className="h-3 w-3" />}
        {score}점
      </div>
    </div>
  );
}

function DaysAgoBadge({ days }: { days: number }) {
  if (days <= 1) return <span className="text-xs text-red-500 font-medium">오늘</span>;
  if (days <= 7) return <span className="text-xs text-orange-500 font-medium">{days}일 전</span>;
  if (days <= 30) return <span className="text-xs text-gray-500">{days}일 전</span>;
  return <span className="text-xs text-gray-400">{days}일 전</span>;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 전체 순위 맵 (점수 기준)
  const globalRankMap = useMemo(() => {
    const map = new Map<string, number>();
    const sorted = [...companies].sort((a, b) => b.score - a.score);
    sorted.forEach((co, i) => {
      map.set((co.ticker ?? co.company_name).toLowerCase(), i + 1);
    });
    return map;
  }, [companies]);

  // 섹터별 그룹핑
  const sectorGroups = useMemo(() => {
    const groupMap = new Map<string, SectorGroup>();

    for (const co of companies) {
      if (!groupMap.has(co.sector)) {
        groupMap.set(co.sector, {
          sector: co.sector,
          companies: [],
          topScore: 0,
          totalScore: 0,
          count: 0,
        });
      }
      const g = groupMap.get(co.sector)!;
      g.companies.push(co);
      g.topScore = Math.max(g.topScore, co.score);
      g.totalScore += co.score;
      g.count++;
    }

    // 섹터 내 기업은 점수순, 섹터는 최고 점수순
    return Array.from(groupMap.values())
      .map((g) => {
        g.companies.sort((a, b) => b.score - a.score);
        return g;
      })
      .sort((a, b) => b.topScore - a.topScore);
  }, [companies]);

  const maxScore = companies[0]?.score
    ? Math.max(...companies.map((c) => c.score))
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">기업 대시보드</h1>
          <span className="text-sm text-gray-400">
            {companies.length}개 기업 · {sectorGroups.length}개 섹터
          </span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          최신 + 직접수혜 + 높은 확신도 = 높은 점수
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 분석된 기업이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sectorGroups.map((group) => (
            <div key={group.sector} className="space-y-2">
              {/* 섹터 헤더 */}
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 ${getSectorColor(group.sector)}`}>
                <Layers className="h-4 w-4 text-gray-400 shrink-0" />
                <h2 className="font-bold text-sm">{group.sector}</h2>
                <span className="text-xs text-gray-400">{group.count}개 기업</span>
                <div className="ml-auto text-xs text-gray-400">
                  합산 {Math.round(group.totalScore * 10) / 10}점
                </div>
              </div>

              {/* 섹터 내 기업 목록 */}
              <div className="space-y-2 pl-2">
                {group.companies.map((co) => {
                  const gRank = globalRankMap.get((co.ticker ?? co.company_name).toLowerCase()) ?? 99;
                  const barWidth = Math.max((co.score / maxScore) * 100, 8);

                  return (
                    <Card
                      key={co.ticker ?? co.company_name}
                      className={`hover:shadow-md transition-shadow ${gRank <= 3 ? "border-l-4 border-l-red-400" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Global Rank */}
                          <div className={`text-2xl font-bold w-8 text-right shrink-0 ${gRank <= 3 ? "text-red-400" : gRank <= 6 ? "text-orange-400" : "text-gray-200"}`}>
                            {gRank}
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Company header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">
                                  {co.company_name}
                                  {co.ticker && (
                                    <span className="ml-2 font-mono text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                      {co.ticker}
                                    </span>
                                  )}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {co.exchange && <span className="text-xs text-gray-400">{co.exchange}</span>}
                                  {co.benefit_types.split(", ").map((bt) => (
                                    <Badge
                                      key={bt}
                                      variant={
                                        bt === "직접수혜" ? "blue" :
                                        bt === "간접수혜" ? "green" :
                                        bt === "직접피해" || bt === "간접피해" ? "red" :
                                        "gray"
                                      }
                                      className="text-xs"
                                    >
                                      {bt}
                                    </Badge>
                                  ))}
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                      confidenceColors[co.confidence_label as keyof typeof confidenceColors] ?? ""
                                    }`}
                                  >
                                    확신도: {co.confidence_label}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 text-right space-y-1">
                                <ScoreBadge score={co.score} globalRank={gRank} />
                                <div className="flex items-center gap-1 justify-end">
                                  <Clock className="h-3 w-3 text-gray-300" />
                                  <DaysAgoBadge days={co.days_ago} />
                                </div>
                              </div>
                            </div>

                            {/* Score bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  gRank <= 3 ? "bg-red-400" : gRank <= 6 ? "bg-orange-400" : "bg-blue-300"
                                }`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>

                            {/* Reason */}
                            {co.top_reason && (
                              <p className="text-xs text-gray-500 leading-relaxed">{co.top_reason}</p>
                            )}

                            {/* Related ideas */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {co.ideas.map((idea) => (
                                <Button
                                  key={idea.id}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs gap-1 text-gray-500 hover:text-blue-600 px-2"
                                  onClick={() => router.push(`/ideas/${idea.id}`)}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {idea.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
