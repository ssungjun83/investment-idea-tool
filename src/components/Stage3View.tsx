import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Shield, BarChart3, LineChart } from "lucide-react";

interface Company {
  id?: number;
  company_name: string;
  ticker?: string | null;
  exchange?: string | null;
  sector: string;
  reason: string;
  benefit_type: string;
  confidence: string;
  moat_type?: string | null;
  moat_reason?: string | null;
  asset_type?: string | null;
}

const benefitTypeVariants: Record<string, "blue" | "green" | "amber" | "red"> = {
  직접수혜: "blue",
  간접수혜: "green",
  공급망수혜: "amber",
  직접피해: "red",
  간접피해: "red",
};

const confidenceConfig = {
  높음: "text-emerald-600 bg-emerald-50",
  보통: "text-amber-600 bg-amber-50",
  낮음: "text-gray-500 bg-gray-50",
};

export default function Stage3View({ companies }: { companies: Company[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {companies.map((co, i) => {
        const conf = confidenceConfig[co.confidence as keyof typeof confidenceConfig];
        return (
          <Card key={co.id ?? i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {co.asset_type === "ETF" ? (
                      <BarChart3 className="h-4 w-4 text-violet-500 shrink-0" />
                    ) : co.asset_type === "지수" ? (
                      <LineChart className="h-4 w-4 text-teal-500 shrink-0" />
                    ) : (
                      <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm inline-flex items-center gap-1">
                        {co.company_name}
                        {co.ticker && (
                          <span className="ml-1 font-mono text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {co.ticker}
                          </span>
                        )}
                        {co.asset_type && co.asset_type !== "기업" && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            co.asset_type === "ETF" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
                          }`}>
                            {co.asset_type}
                          </span>
                        )}
                      </p>
                      {co.exchange && (
                        <p className="text-xs text-gray-400 mt-0.5">{co.exchange}</p>
                      )}
                    </div>
                  </div>
                  {conf && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${conf}`}>
                      확신도: {co.confidence}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={benefitTypeVariants[co.benefit_type] ?? "gray"}>
                    {co.benefit_type}
                  </Badge>
                  <Badge variant="gray">{co.sector}</Badge>
                  {co.moat_type && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${
                        co.moat_type === "넓음" ? "text-amber-600 bg-amber-50 border-amber-200" :
                        co.moat_type === "보통" ? "text-sky-600 bg-sky-50 border-sky-200" :
                        "text-gray-400 bg-gray-50 border-gray-200"
                      }`}
                      title={co.moat_reason ?? ""}
                    >
                      {co.moat_type === "넓음" && <Shield className="h-3 w-3" />}
                      {co.moat_type === "넓음" ? "Wide Moat" : co.moat_type === "보통" ? "Narrow Moat" : "No Moat"}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">{co.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
