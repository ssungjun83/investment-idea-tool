"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Loader2, Flame, Clock, TrendingUp, X, Shield, BarChart3, LineChart, Search, RotateCcw, FileText, Download } from "lucide-react";
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
  moat_type: string | null;
  moat_reason: string | null;
  asset_type: string;
  turnaround_stage: string | null;
  turnaround_reason: string | null;
  reports: { id: number; title: string; file_path: string; report_date: string | null }[];
  ideas: { id: number; title: string; date: string }[];
  latest_date: string;
  days_ago: number;
}

const moatConfig = {
  넓음: { label: "Wide Moat", color: "text-amber-600 bg-amber-50 border-amber-200", icon: true },
  보통: { label: "Narrow Moat", color: "text-sky-600 bg-sky-50 border-sky-200", icon: false },
  좁음: { label: "No Moat", color: "text-gray-400 bg-gray-50 border-gray-200", icon: false },
};

const confidenceColors = {
  높음: "bg-emerald-50 text-emerald-700 border-emerald-200",
  보통: "bg-amber-50 text-amber-700 border-amber-200",
  낮음: "bg-gray-50 text-gray-500 border-gray-200",
};

function ScoreBadge({ score, rank }: { score: number; rank: number }) {
  const color =
    score < 0 ? "bg-red-100 text-red-600 border border-red-200" :
    rank <= 3 ? "bg-red-500 text-white" :
    rank <= 6 ? "bg-orange-500 text-white" :
    "bg-gray-200 text-gray-600";

  return (
    <div className="text-center">
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${color}`}>
        {score >= 0 && rank <= 3 && <Flame className="h-3 w-3" />}
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
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 섹터별 기업 수 + 최고 점수 (칩 정렬용)
  const sectorInfo = useMemo(() => {
    const map = new Map<string, { count: number; topScore: number }>();
    for (const co of companies) {
      const info = map.get(co.sector) ?? { count: 0, topScore: 0 };
      info.count++;
      info.topScore = Math.max(info.topScore, co.score);
      map.set(co.sector, info);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].topScore - a[1].topScore);
  }, [companies]);

  // 필터된 기업 목록
  const filtered = useMemo(() => {
    let list = companies;
    if (activeSector) list = list.filter((co) => co.sector === activeSector);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((co) =>
        co.company_name.toLowerCase().includes(q) ||
        (co.ticker?.toLowerCase().includes(q)) ||
        co.sector.toLowerCase().includes(q) ||
        co.top_reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [companies, activeSector, search]);

  const maxScore = useMemo(() => {
    const scores = companies.map((c) => Math.abs(c.score));
    return Math.max(...scores, 1);
  }, [companies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">기업 대시보드</h1>
          <span className="text-sm text-gray-400">{companies.length}개 기업</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          최신 × 수혜유형 × 확신도 × 해자 × 턴어라운드 = 점수
        </div>
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="기업명, 티커, 섹터 검색..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 섹터 필터 칩 */}
      {sectorInfo.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 shrink-0">섹터:</span>
          {sectorInfo.map(([sector, info]) => {
            const isActive = activeSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setActiveSector(isActive ? null : sector)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {sector}
                <span className={`text-[10px] ${isActive ? "text-blue-200" : "text-gray-400"}`}>
                  {info.count}
                </span>
                {isActive && <X className="h-3 w-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 기업 목록 */}
      {companies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 분석된 기업이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((co, i) => {
            const rank = i + 1;
            const barWidth = Math.max((Math.abs(co.score) / maxScore) * 100, 8);
            const isNegative = co.score < 0;

            return (
              <Card
                key={co.ticker ?? co.company_name}
                className={`hover:shadow-md transition-shadow ${
                  isNegative ? "border-l-4 border-l-red-300 opacity-75" :
                  rank <= 3 && !activeSector ? "border-l-4 border-l-red-400" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className={`text-2xl font-bold w-8 text-right shrink-0 ${
                      isNegative ? "text-red-300" :
                      rank <= 3 && !activeSector ? "text-red-400" :
                      rank <= 6 && !activeSector ? "text-orange-400" :
                      "text-gray-200"
                    }`}>
                      {rank}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Company header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold inline-flex items-center gap-1.5">
                            {co.asset_type === "ETF" ? (
                              <BarChart3 className="h-4 w-4 text-violet-500 shrink-0" />
                            ) : co.asset_type === "지수" ? (
                              <LineChart className="h-4 w-4 text-teal-500 shrink-0" />
                            ) : null}
                            {co.company_name}
                            {co.ticker && (
                              <span className="ml-1 font-mono text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {co.ticker}
                              </span>
                            )}
                            {co.asset_type !== "기업" && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                co.asset_type === "ETF" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
                              }`}>
                                {co.asset_type}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {co.exchange && <span className="text-xs text-gray-400">{co.exchange}</span>}
                            <button
                              onClick={() => setActiveSector(activeSector === co.sector ? null : co.sector)}
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors cursor-pointer ${
                                activeSector === co.sector
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-gray-100 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                              }`}
                            >
                              {co.sector}
                            </button>
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
                            {co.moat_type && moatConfig[co.moat_type as keyof typeof moatConfig] && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${
                                  moatConfig[co.moat_type as keyof typeof moatConfig].color
                                }`}
                                title={co.moat_reason ?? ""}
                              >
                                {moatConfig[co.moat_type as keyof typeof moatConfig].icon && <Shield className="h-3 w-3" />}
                                {moatConfig[co.moat_type as keyof typeof moatConfig].label}
                              </span>
                            )}
                            {co.turnaround_stage && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${
                                  co.turnaround_stage === "역발상"
                                    ? "text-orange-700 bg-orange-50 border-orange-300 animate-pulse"
                                    : "text-cyan-700 bg-cyan-50 border-cyan-300"
                                }`}
                                title={co.turnaround_reason ?? ""}
                              >
                                <RotateCcw className="h-3 w-3" />
                                {co.turnaround_stage === "역발상" ? "Turnaround" : "Recovery"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right space-y-1">
                          <ScoreBadge score={co.score} rank={rank} />
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
                            isNegative ? "bg-red-400" :
                            rank <= 3 && !activeSector ? "bg-red-400" :
                            rank <= 6 && !activeSector ? "bg-orange-400" :
                            "bg-blue-300"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {/* Reason */}
                      {co.top_reason && (
                        <p className="text-xs text-gray-500 leading-relaxed">{co.top_reason}</p>
                      )}

                      {/* Related ideas + reports */}
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
                        {co.reports?.map((report) => (
                          <a
                            key={report.id}
                            href={report.file_path}
                            download
                            className="inline-flex items-center gap-1 h-6 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-3 w-3" />
                            {report.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
