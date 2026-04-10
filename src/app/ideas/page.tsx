import { Suspense } from "react";
import { listIdeas } from "@/lib/db/queries";
import IdeaCard from "@/components/IdeaCard";
import { BookOpen, Search } from "lucide-react";

interface Props {
  searchParams: { q?: string; keyword?: string };
}

async function IdeasList({ q, keyword }: { q?: string; keyword?: string }) {
  const ideas = await listIdeas({ q, keyword, limit: 50 });

  if (ideas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          {q || keyword ? "검색 결과가 없습니다." : "아직 저장된 아이디어가 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

export default function IdeasPage({ searchParams }: Props) {
  const { q, keyword } = searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">아이디어 목록</h1>
        {(q || keyword) && (
          <span className="text-sm text-gray-500">
            — {q ? `"${q}" 검색 결과` : `키워드: "${keyword}"`}
          </span>
        )}
      </div>

      <Suspense fallback={<div className="text-sm text-gray-400 py-8 text-center">로딩 중...</div>}>
        <IdeasList q={q} keyword={keyword} />
      </Suspense>
    </div>
  );
}
