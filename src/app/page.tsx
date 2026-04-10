import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IdeaInputForm from "@/components/IdeaInputForm";
import IdeaCard from "@/components/IdeaCard";
import { listIdeas } from "@/lib/db/queries";
import { ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

async function RecentIdeas() {
  try {
    const ideas = await listIdeas({ limit: 6 });
    if (ideas.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400 text-sm">
          아직 저장된 아이디어가 없습니다. 첫 번째 아이디어를 입력해보세요!
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">최근 아이디어</h2>
          <Link
            href="/ideas"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            전체 보기 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        DB 연결을 확인해주세요. (.env.local 설정 필요)
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Lightbulb className="h-7 w-7 text-amber-400" />
          <h1 className="text-3xl font-bold text-gray-900">투자 아이디어 분석</h1>
        </div>
        <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          투자 아이디어를 입력하면 AI가 사이드이펙트와 수혜 기업을 자동으로 분석합니다.
          모든 아이디어는 키워드로 연결되어 거미줄 그래프로 탐색할 수 있습니다.
        </p>
      </div>

      {/* Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base">새 아이디어 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaInputForm />
        </CardContent>
      </Card>

      {/* Recent ideas */}
      <Suspense fallback={<div className="text-center text-sm text-gray-400 py-4">로딩 중...</div>}>
        <RecentIdeas />
      </Suspense>
    </div>
  );
}
