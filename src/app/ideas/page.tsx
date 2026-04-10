"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import IdeaCard from "@/components/IdeaCard";
import { BookOpen, Search, Loader2 } from "lucide-react";
import type { IdeaListItem } from "@/types/analysis";

function IdeasContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const keyword = searchParams.get("keyword") ?? undefined;

  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (keyword) params.set("keyword", keyword);
    const url = `/api/ideas${params.toString() ? `?${params}` : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setIdeas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q, keyword]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

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

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">아이디어 목록</h1>
      </div>
      <Suspense>
        <IdeasContent />
      </Suspense>
    </div>
  );
}
