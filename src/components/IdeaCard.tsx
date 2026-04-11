import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, TrendingUp, TrendingDown, ArrowRight, ChevronRight } from "lucide-react";
import type { IdeaListItem } from "@/types/analysis";

// 제목에서 방향성 감지
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
  },
  down: {
    icon: TrendingDown,
    bg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-l-red-400",
  },
  neutral: {
    icon: ArrowRight,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    border: "border-l-blue-400",
  },
};

const categoryColors: Record<string, "blue" | "green" | "amber" | "purple" | "red" | "gray"> = {
  테마: "purple",
  섹터: "blue",
  회사: "amber",
  기술: "green",
  지역: "red",
  리스크: "red",
};

function relativeDate(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days <= 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function IdeaCard({ idea }: { idea: IdeaListItem }) {
  const dir = detectDirection(idea.title);
  const config = directionConfig[dir];
  const Icon = config.icon;

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div
        className={`group flex items-stretch rounded-xl border border-l-4 ${config.border} bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer`}
      >
        {/* 방향 아이콘 */}
        <div className={`flex items-center justify-center px-4 ${config.bg} rounded-l-lg`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-4 min-w-0 space-y-2">
          {/* 제목 */}
          <h3 className="font-bold text-base text-gray-900 leading-tight">
            {idea.title}
          </h3>

          {/* 테마 (부제) */}
          {idea.theme && (
            <p className="text-sm text-gray-500 leading-snug line-clamp-1">
              {idea.theme}
            </p>
          )}

          {/* 키워드 + 메타 */}
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

        {/* 오른쪽: 날짜 + 기업수 + 화살표 */}
        <div className="flex items-center gap-3 pr-4 pl-2 shrink-0">
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
              <Calendar className="h-3 w-3" />
              {relativeDate(idea.created_at)}
            </div>
            {idea.company_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                <Building2 className="h-3 w-3" />
                <span className="font-medium">{idea.company_count}개 종목</span>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
