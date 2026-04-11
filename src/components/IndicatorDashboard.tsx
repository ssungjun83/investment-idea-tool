"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Newspaper,
  BarChart3,
  Gauge,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IndicatorChart from "./IndicatorChart";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
}

interface Snapshot {
  id: number;
  date: string;
  direction: string;
  sentiment_score: number;
  summary: string;
  forecast: string;
  forecast_confidence: string;
  news_items: NewsItem[];
  user_ideas_context: string | null;
}

interface IndicatorData {
  id: number;
  name: string;
  name_en: string | null;
  category: string;
  description: string | null;
  latest: Snapshot | null;
  history: Snapshot[];
}

const categoryConfig: Record<string, { color: string; bg: string }> = {
  원자재: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  운임: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  금리: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  환율: { color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  산업: { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
};

const directionConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "상승" },
  down: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50", label: "하락" },
  neutral: { icon: ArrowRight, color: "text-gray-500", bg: "bg-gray-50", label: "보합" },
};

function SentimentBar({ score }: { score: number }) {
  const normalized = (score + 100) / 2; // 0~100
  const color =
    score > 30 ? "bg-emerald-500" :
    score > 0 ? "bg-emerald-300" :
    score > -30 ? "bg-gray-400" :
    score > -60 ? "bg-red-300" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(normalized, 5)}%` }}
        />
      </div>
      <span className={`text-xs font-bold min-w-[36px] text-right ${
        score > 0 ? "text-emerald-600" : score < 0 ? "text-red-600" : "text-gray-500"
      }`}>
        {score > 0 ? "+" : ""}{score}
      </span>
    </div>
  );
}

function IndicatorCard({ indicator, onRefresh, refreshingId }: {
  indicator: IndicatorData;
  onRefresh: (id: number) => void;
  refreshingId: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const latest = indicator.latest;
  const dir = directionConfig[(latest?.direction ?? "neutral") as keyof typeof directionConfig];
  const DirIcon = dir.icon;
  const cat = categoryConfig[indicator.category] ?? categoryConfig["산업"];
  const isRefreshing = refreshingId === indicator.id;

  return (
    <Card className={`transition-all hover:shadow-md ${
      !latest ? "opacity-60" : ""
    }`}>
      <CardContent className="p-0">
        {/* 헤더 */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${cat.bg} ${cat.color}`}>
                  {indicator.category}
                </span>
                {latest && (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${dir.color}`}>
                    <DirIcon className="h-3.5 w-3.5" />
                    {dir.label}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-gray-900 leading-tight">
                {indicator.name}
              </h3>
              {indicator.name_en && (
                <p className="text-[11px] text-gray-400 mt-0.5">{indicator.name_en}</p>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(indicator.id); }}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* 센티먼트 바 */}
          {latest && (
            <div className="mt-3">
              <SentimentBar score={latest.sentiment_score} />
            </div>
          )}

          {/* 미니 차트 */}
          {indicator.history.length > 1 && (
            <div className="mt-3 h-16">
              <IndicatorChart data={indicator.history} />
            </div>
          )}

          {/* 요약 */}
          {latest ? (
            <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-2">
              {latest.summary}
            </p>
          ) : (
            <div className="mt-3 text-center py-3">
              <AlertCircle className="h-5 w-5 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">아직 데이터가 없습니다</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs h-7"
                onClick={() => onRefresh(indicator.id)}
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                분석 시작
              </Button>
            </div>
          )}
        </div>

        {/* 확장 영역 */}
        {latest && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t"
            >
              {expanded ? (
                <>접기 <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>전망 & 뉴스 <ChevronDown className="h-3 w-3" /></>
              )}
            </button>

            {expanded && (
              <div className="px-4 pb-4 space-y-4 border-t bg-gray-50/50">
                {/* 전망 */}
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-700">AI 전망</span>
                    {latest.forecast_confidence && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                        latest.forecast_confidence === "높음" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        latest.forecast_confidence === "보통" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        확신도: {latest.forecast_confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border">
                    {latest.forecast}
                  </p>
                </div>

                {/* 사용자 컨텍스트 반영 여부 */}
                {latest.user_ideas_context && (
                  <div className="flex items-start gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-blue-600">
                      내 투자 아이디어 {latest.user_ideas_context.split("\n").length}건 반영됨
                    </p>
                  </div>
                )}

                {/* 뉴스 기사 */}
                {latest.news_items.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Newspaper className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-700">관련 뉴스</span>
                    </div>
                    <div className="space-y-1.5">
                      {latest.news_items.slice(0, 5).map((news, i) => (
                        <a
                          key={i}
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-lg bg-white border hover:border-blue-200 hover:shadow-sm transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:text-blue-700">
                              {news.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400">{news.source}</span>
                              <span className="text-[10px] text-gray-300">{news.date}</span>
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 최종 업데이트 시간 */}
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  마지막 업데이트: {latest.date}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function IndicatorDashboard() {
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/indicators")
      .then((r) => r.json())
      .then((data) => {
        setIndicators(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const refreshOne = async (id: number) => {
    setRefreshingId(id);
    try {
      await fetch("/api/indicators/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicator_id: id }),
      });
      loadData();
    } catch (err) {
      console.error("refresh error:", err);
    } finally {
      setRefreshingId(null);
    }
  };

  const refreshAll = async () => {
    setRefreshingAll(true);
    try {
      await fetch("/api/indicators/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      loadData();
    } catch (err) {
      console.error("refresh all error:", err);
    } finally {
      setRefreshingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // 카테고리별 그룹
  const categories = Array.from(new Set(indicators.map((ind) => ind.category)));

  // 전체 통계
  const withData = indicators.filter((ind) => ind.latest);
  const upCount = withData.filter((ind) => ind.latest?.direction === "up").length;
  const downCount = withData.filter((ind) => ind.latest?.direction === "down").length;
  const avgSentiment = withData.length > 0
    ? Math.round(withData.reduce((sum, ind) => sum + (ind.latest?.sentiment_score ?? 0), 0) / withData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">핵심지표 모니터링</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={refreshingAll}
          className="text-xs"
        >
          {refreshingAll ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> 전체 분석 중...</>
          ) : (
            <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> 전체 새로고침</>
          )}
        </Button>
      </div>

      {/* 전체 요약 */}
      {withData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <BarChart3 className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <div className="text-xl font-bold">{indicators.length}</div>
              <div className="text-[10px] text-gray-400">추적 지표</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
              <div className="text-xl font-bold text-emerald-600">{upCount}</div>
              <div className="text-[10px] text-gray-400">상승 지표</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-4 w-4 mx-auto text-red-500 mb-1" />
              <div className="text-xl font-bold text-red-600">{downCount}</div>
              <div className="text-[10px] text-gray-400">하락 지표</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Gauge className="h-4 w-4 mx-auto text-purple-500 mb-1" />
              <div className={`text-xl font-bold ${
                avgSentiment > 0 ? "text-emerald-600" : avgSentiment < 0 ? "text-red-600" : "text-gray-500"
              }`}>
                {avgSentiment > 0 ? "+" : ""}{avgSentiment}
              </div>
              <div className="text-[10px] text-gray-400">평균 심리지수</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 지표 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <IndicatorCard
            key={ind.id}
            indicator={ind}
            onRefresh={refreshOne}
            refreshingId={refreshingId}
          />
        ))}
      </div>
    </div>
  );
}
