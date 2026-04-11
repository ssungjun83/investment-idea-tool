"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Loader2, Search, X, Calendar, Building2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReportData {
  id: number;
  title: string;
  company_name: string;
  ticker: string | null;
  exchange: string | null;
  summary: string;
  key_points: string[];
  risks: string[];
  file_name: string;
  file_path: string;
  page_count: number | null;
  source: string | null;
  report_date: string | null;
  created_at: string;
  linked_companies: { company_id: number; company_name: string; ticker: string | null }[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? reports.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          (r.ticker?.toLowerCase().includes(q)) ||
          r.summary.toLowerCase().includes(q)
        );
      })
    : reports;

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
          <FileText className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">기업 레포트</h1>
          <span className="text-sm text-gray-400">{reports.length}건</span>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="기업명, 티커, 내용 검색..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 등록된 레포트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const isExpanded = expanded.has(report.id);
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* 헤더 */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight">{report.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-700">{report.company_name}</span>
                          {report.ticker && (
                            <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {report.ticker}
                            </span>
                          )}
                          {report.exchange && (
                            <span className="text-xs text-gray-400">{report.exchange}</span>
                          )}
                          {report.source && (
                            <Badge variant="gray" className="text-xs">{report.source}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {report.report_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {report.report_date}
                          </div>
                        )}
                        <a
                          href={report.file_path}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      </div>
                    </div>

                    {/* 요약 */}
                    <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>

                    {/* 확장 토글 */}
                    <button
                      onClick={() => toggleExpand(report.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isExpanded ? "접기" : "핵심 포인트 & 리스크 보기"}
                    </button>
                  </div>

                  {/* 확장 영역 */}
                  {isExpanded && (
                    <div className="border-t px-5 py-4 bg-gray-50/50 space-y-4">
                      {report.key_points.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            핵심 포인트
                          </h4>
                          <ul className="space-y-1.5">
                            {report.key_points.map((point, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5 shrink-0">-</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.risks.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            리스크 요인
                          </h4>
                          <ul className="space-y-1.5">
                            {report.risks.map((risk, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 푸터 */}
                  {report.page_count && (
                    <div className="border-t px-5 py-2.5 flex items-center justify-between text-xs text-gray-400">
                      <span>{report.page_count}p</span>
                      <span>{report.file_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
