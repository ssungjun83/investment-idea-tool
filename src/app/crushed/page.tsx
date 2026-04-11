"use client";

import { useEffect, useState } from "react";
import {
  Skull,
  TrendingDown,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowDownRight,
  Clock,
  Target,
  AlertTriangle,
  Flame,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CrushedStock {
  ticker: string;
  name: string;
  exchange: string;
  current_price: number;
  week52_low: number;
  week52_high: number;
  off_from_high_pct: number;
  near_low_pct: number;
  volume: number;
  market_cap: number | null;
  ai_comment: string;
  recovery_potential: "높음" | "보통" | "낮음";
}

interface CrushedSector {
  sector: string;
  sector_en: string;
  etf_ticker: string;
  etf_price: number | null;
  etf_off_high_pct: number | null;
  stocks: CrushedStock[];
  ai_summary: string;
}

interface ScanData {
  date: string | null;
  sectors: CrushedSector[];
  total_stocks: number;
}

const recoveryConfig = {
  높음: { color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: Flame, label: "회복 높음" },
  보통: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: Target, label: "회복 보통" },
  낮음: { color: "text-gray-500 bg-gray-50 border-gray-200", icon: AlertTriangle, label: "회복 낮음" },
};

function formatMarketCap(cap: number | null): string {
  if (!cap) return "";
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap.toLocaleString()}`;
}

function DropBar({ pct }: { pct: number }) {
  const width = Math.min(pct, 80);
  const color =
    pct >= 50 ? "bg-red-600" :
    pct >= 35 ? "bg-red-500" :
    pct >= 25 ? "bg-orange-500" :
    "bg-amber-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs font-bold text-red-600 min-w-[40px] text-right">-{pct}%</span>
    </div>
  );
}

function SectorCard({ sector }: { sector: CrushedSector }) {
  const [expanded, setExpanded] = useState(true);
  const highRecovery = sector.stocks.filter((s) => s.recovery_potential === "높음").length;

  return (
    <Card className="border-l-4 border-l-red-400">
      <CardContent className="p-0">
        {/* 섹터 헤더 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{sector.sector}</h3>
                <span className="text-xs text-gray-400">{sector.sector_en}</span>
                <Badge variant="gray" className="text-[10px]">{sector.etf_ticker}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {sector.etf_off_high_pct != null && (
                  <span className="text-sm text-red-600 font-semibold flex items-center gap-0.5">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    ETF 고점 대비 -{sector.etf_off_high_pct}%
                  </span>
                )}
                <span className="text-xs text-gray-400">{sector.stocks.length}개 종목 하락</span>
                {highRecovery > 0 && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                    <Flame className="h-3 w-3" />
                    회복 유망 {highRecovery}개
                  </span>
                )}
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* AI 요약 */}
            {sector.ai_summary && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{sector.ai_summary}</p>
              </div>
            )}

            {/* 종목 리스트 */}
            <div className="space-y-2">
              {sector.stocks.map((stock) => {
                const rc = recoveryConfig[stock.recovery_potential];
                const RcIcon = rc.icon;

                return (
                  <div
                    key={stock.ticker}
                    className={`p-3 rounded-lg border transition-all ${
                      stock.recovery_potential === "높음"
                        ? "bg-emerald-50/50 border-emerald-200 hover:shadow-md"
                        : "bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{stock.name}</span>
                          <a
                            href={`https://finance.yahoo.com/quote/${stock.ticker}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 inline-flex items-center gap-0.5"
                          >
                            {stock.ticker}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                          <span className="text-[10px] text-gray-400">{stock.exchange}</span>
                          {stock.market_cap && (
                            <span className="text-[10px] text-gray-400">{formatMarketCap(stock.market_cap)}</span>
                          )}
                        </div>

                        {/* 가격 정보 */}
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-lg font-bold text-gray-900">
                            ${stock.current_price.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            52주: ${stock.week52_low.toLocaleString()} ~ ${stock.week52_high.toLocaleString()}
                          </span>
                        </div>

                        {/* 하락률 바 */}
                        <div className="mt-1.5">
                          <DropBar pct={stock.off_from_high_pct} />
                        </div>

                        {/* AI 코멘트 */}
                        {stock.ai_comment && (
                          <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{stock.ai_comment}</p>
                        )}
                      </div>

                      {/* 회복 잠재력 배지 */}
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${rc.color}`}>
                          <RcIcon className="h-3 w-3" />
                          {rc.label}
                        </span>
                        {stock.near_low_pct <= 5 && (
                          <div className="text-center mt-1">
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                              52주 바닥권
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CrushedPage() {
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    fetch("/api/crushed")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/crushed/refresh", { method: "POST" });
      loadData();
    } catch (err) {
      console.error("refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const sectors = data?.sectors ?? [];
  const totalStocks = data?.total_stocks ?? 0;
  const highRecoveryTotal = sectors.reduce(
    (sum, s) => sum + s.stocks.filter((st) => st.recovery_potential === "높음").length,
    0
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Skull className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">박살기업</h1>
          <span className="text-sm text-gray-400">52주 고점 대비 20%+ 하락</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs"
        >
          {refreshing ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> 스캔 중... (약 3분)</>
          ) : (
            <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> 새로 스캔</>
          )}
        </Button>
      </div>

      {/* 요약 */}
      {data?.date && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-red-600 font-semibold flex items-center gap-1">
              <TrendingDown className="h-4 w-4" /> 하락 종목 {totalStocks}개
            </span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Flame className="h-4 w-4" /> 회복 유망 {highRecoveryTotal}개
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {data.date}
            </span>
          </div>
        </div>
      )}

      {/* 데이터 없는 경우 */}
      {sectors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Skull className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-4">아직 스캔 데이터가 없습니다</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 스캔 중...</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" /> 첫 스캔 시작</>
            )}
          </Button>
          <p className="text-xs text-gray-300 mt-3">
            14개 섹터 × 10-12종목 스캔, 약 2-3분 소요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sectors.map((sector) => (
            <SectorCard key={sector.sector} sector={sector} />
          ))}
        </div>
      )}
    </div>
  );
}
