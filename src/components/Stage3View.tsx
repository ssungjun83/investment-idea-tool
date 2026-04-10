import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp } from "lucide-react";

interface Company {
  id?: number;
  company_name: string;
  ticker?: string | null;
  exchange?: string | null;
  sector: string;
  reason: string;
  benefit_type: string;
  confidence: string;
}

const benefitTypeVariants: Record<string, "blue" | "green" | "amber"> = {
  직접수혜: "blue",
  간접수혜: "green",
  공급망수혜: "amber",
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
                    <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{co.company_name}</p>
                      {co.ticker && (
                        <p className="text-xs text-gray-500">
                          {co.ticker}
                          {co.exchange && ` · ${co.exchange}`}
                        </p>
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
