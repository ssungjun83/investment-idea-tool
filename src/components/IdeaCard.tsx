import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown, ArrowRight, ChevronRight } from "lucide-react";
import type { IdeaListItem } from "@/types/analysis";

function detectDirection(title: string): "up" | "down" | "neutral" {
  const upWords = ["상승", "급증", "증가", "강세", "반등", "확대", "호황", "오른", "올라"];
  const downWords = ["하락", "감소", "붕괴", "약세", "하향", "축소", "둔화", "위축", "피해", "내려"];
  const t = title.toLowerCase();
  if (upWords.some((w) => t.includes(w))) return "up";
  if (downWords.some((w) => t.includes(w))) return "down";
  return "neutral";
}

const directionConfig = {
  up: {
    icon: TrendingUp,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    border: "border-l-emerald-400",
    dateBg: "text-emerald-700",
  },
  down: {
    icon: TrendingDown,
    bg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-l-red-400",
    dateBg: "text-red-700",
  },
  neutral: {
    icon: ArrowRight,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    border: "border-l-blue-400",
    dateBg: "text-blue-700",
  },
};

function formatYearMonth(dateStr: string): { year: string; month: string } {
  const d = new Date(dateStr);
  return { year: `${d.getFullYear()}`, month: `${d.getMonth() + 1}월` };
}

export default function IdeaCard({ idea }: { idea: IdeaListItem }) {
  const dir = detectDirection(idea.title);
  const config = directionConfig[dir];
  const Icon = config.icon;
  const date = formatYearMonth(idea.created_at);

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div
        className={`group flex items-stretch rounded-xl border border-l-4 ${config.border} bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer`}
      >
        {/* 왼쪽: 날짜 + 방향 아이콘 */}
        <div className={`flex flex-col items-center justify-center px-5 py-4 ${config.bg} rounded-l-lg min-w-[84px]`}>
          <span className="text-xs font-semibold text-gray-500 tracking-wide">{date.year}</span>
          <span className={`text-2xl font-extrabold ${config.dateBg} leading-none mt-0.5`}>{date.month}</span>
          <Icon className={`h-5 w-5 mt-1.5 ${config.iconColor}`} />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-4 min-w-0 space-y-2">
          <h3 className="font-bold text-base text-gray-900 leading-tight">
            {idea.title}
          </h3>

          {idea.theme && (
            <p className="text-sm text-gray-500 leading-snug line-clamp-1">
              {idea.theme}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {idea.keywords.slice(0, 5).map((kw, i) => (
              <Badge key={i} variant="gray" className="text-[11px] py-0 px-2">
                {kw}
              </Badge>
            ))}
            {idea.keywords.length > 5 && (
              <span className="text-xs text-gray-400">+{idea.keywords.length - 5}</span>
            )}
          </div>
        </div>

        {/* 오른쪽: 기업수 + 화살표 */}
        <div className="flex items-center gap-3 pr-4 pl-2 shrink-0">
          {idea.company_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Building2 className="h-3.5 w-3.5" />
              <span className="font-medium">{idea.company_count}개 종목</span>
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
