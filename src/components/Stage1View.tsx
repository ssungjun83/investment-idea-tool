import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Zap, BookOpen } from "lucide-react";

interface Stage1 {
  theme: string;
  background: string;
  mechanism: string;
  timeline: string;
  risk_factors: string[];
}

export default function Stage1View({ data }: { data: Stage1 }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">핵심 테마</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-blue-700">{data.theme}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-base">배경 및 근거</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{data.background}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">작동 메커니즘</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {data.mechanism}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">예상 전개 시간표</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {data.timeline}
          </p>
        </CardContent>
      </Card>

      {data.risk_factors?.length > 0 && (
        <Card className="border-red-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base text-red-700">주요 리스크</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.risk_factors.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Badge variant="red" className="mt-0.5 shrink-0">리스크 {i + 1}</Badge>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
