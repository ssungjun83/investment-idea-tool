"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import IdeaCard from "@/components/IdeaCard";
import { BookOpen, Search, Loader2, X } from "lucide-react";
import type { IdeaListItem } from "@/types/analysis";

function IdeasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const keyword = searchParams.get("keyword") ?? undefined;

  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQ);
  const [activeQ, setActiveQ] = useState(initialQ);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeQ) params.set("q", activeQ);
    if (keyword) params.set("keyword", keyword);
    const url = `/api/ideas${params.toString() ? `?${params}` : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setIdeas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeQ, keyword]);

  function handleChange(val: string) {
    setSearch(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setActiveQ(val), 300);
  }

  function clearSearch() {
    setSearch("");
    setActiveQ("");
    router.push("/ideas");
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="아이디어 제목·내용 검색..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button onClick={clearSearch} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {activeQ || keyword ? "검색 결과가 없습니다." : "아직 저장된 아이디어가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
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
