"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Keyword {
  id: number;
  name: string;
  category: string;
}

const categoryVariants: Record<string, "blue" | "green" | "amber" | "red" | "purple" | "gray"> = {
  테마: "blue",
  섹터: "green",
  지역: "amber",
  회사: "gray",
  기술: "purple",
  리스크: "red",
};

export default function KeywordBadges({ keywords }: { keywords: Keyword[] }) {
  const router = useRouter();

  if (!keywords.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <Badge
          key={kw.id}
          variant={categoryVariants[kw.category] ?? "gray"}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            router.push(`/graph?keyword=${encodeURIComponent(kw.name)}`)
          }
        >
          {kw.name}
        </Badge>
      ))}
    </div>
  );
}
