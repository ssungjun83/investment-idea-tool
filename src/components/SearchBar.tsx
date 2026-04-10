"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Keyword {
  id: number;
  name: string;
  category: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Keyword[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/keywords?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(kw: Keyword) {
    setOpen(false);
    setQuery("");
    router.push(`/graph?keyword=${encodeURIComponent(kw.name)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/ideas?q=${encodeURIComponent(query)}`);
    }
  }

  const categoryColors: Record<string, string> = {
    테마: "text-blue-600",
    섹터: "text-emerald-600",
    지역: "text-amber-600",
    회사: "text-orange-600",
    기술: "text-violet-600",
    리스크: "text-red-600",
  };

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="키워드 검색..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((kw) => (
            <button
              key={kw.id}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 text-left"
              onClick={() => handleSelect(kw)}
            >
              <span className="font-medium">{kw.name}</span>
              <span className={`text-xs ${categoryColors[kw.category] ?? "text-gray-500"}`}>
                {kw.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
