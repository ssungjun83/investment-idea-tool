import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Tag } from "lucide-react";
import type { IdeaListItem } from "@/types/analysis";
import { formatDate } from "@/lib/utils";

export default function IdeaCard({ idea }: { idea: IdeaListItem }) {
  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm leading-tight text-gray-900 line-clamp-2">
              {idea.title}
            </h3>

            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {idea.raw_input}
            </p>

            {idea.keywords.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3 text-gray-400" />
                {idea.keywords.slice(0, 4).map((kw, i) => (
                  <Badge key={i} variant="gray" className="text-xs py-0">
                    {kw}
                  </Badge>
                ))}
                {idea.keywords.length > 4 && (
                  <span className="text-xs text-gray-400">+{idea.keywords.length - 4}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(idea.created_at)}</span>
              </div>
              {idea.company_count > 0 && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>수혜 기업 {idea.company_count}개</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
