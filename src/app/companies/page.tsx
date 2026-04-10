"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, ArrowUpDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyData {
  company_name: string;
  ticker: string | null;
  exchange: string | null;
  sector: string;
  mention_count: number;
  avg_confidence: number;
  confidence_label: string;
  benefit_types: string;
  ideas: { id: number; title: string }[];
}

type SortKey = "mention_count" | "avg_confidence" | "company_name";

const confidenceColors = {
  높음: "bg-emerald-50 text-emerald-700 border-emerald-200",
  보통: "bg-amber-50 text-amber-700 border-amber-200",
  낮음: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("mention_count");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...companies].sort((a, b) => {
    if (sortKey === "company_name") return a.company_name.localeCompare(b.company_name);
    return b[sortKey] - a[sortKey];
  });

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
          <span className="text-sm text-gray-400">{companies.length}개 기업</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          {(["mention_count", "avg_confidence", "company_name"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                sortKey === key ? "bg-blue-100 text-blue-700 font-medium" : "bg-gray-100 text-gray-500"
              }`}
            >
              {key === "mention_count" ? "언급순" : key === "avg_confidence" ? "확신도순" : "이름순"}
            </button>
          ))}
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 분석된 기업이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((co, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {co.company_name}
                      {co.ticker && (
                        <span className="ml-1.5 font-mono text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {co.ticker}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {co.exchange && <span className="text-xs text-gray-400">{co.exchange}</span>}
                      <Badge variant="gray" className="text-xs">{co.sector}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-blue-600">{co.mention_count}</div>
                    <div className="text-xs text-gray-400">회 언급</div>
                  </div>
                </div>

                {/* Confidence + Benefit */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      confidenceColors[co.confidence_label as keyof typeof confidenceColors] ?? confidenceColors["보통"]
                    }`}
                  >
                    확신도: {co.confidence_label}
                  </span>
                  {co.benefit_types?.split(", ").map((bt) => (
                    <Badge key={bt} variant="blue" className="text-xs">{bt}</Badge>
                  ))}
                </div>

                {/* Related Ideas */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-medium">관련 아이디어</p>
                  {co.ideas.map((idea) => (
                    <Button
                      key={idea.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-7 gap-1 text-gray-600 hover:text-blue-600"
                      onClick={() => router.push(`/ideas/${idea.id}`)}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{idea.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
