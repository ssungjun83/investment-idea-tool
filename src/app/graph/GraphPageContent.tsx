"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Network, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CytoscapeElements, CytoscapeNodeData } from "@/types/graph";

const GraphViewer = dynamic(() => import("@/components/GraphViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
      <p className="text-sm text-gray-400">그래프 로딩 중...</p>
    </div>
  ),
});

const NODE_LABELS: Record<string, { label: string; color: string }> = {
  keyword: { label: "키워드", color: "bg-emerald-100 text-emerald-700" },
  idea: { label: "아이디어", color: "bg-blue-100 text-blue-700" },
  company: { label: "수혜 기업", color: "bg-amber-100 text-amber-700" },
  effect: { label: "사이드이펙트", color: "bg-violet-100 text-violet-700" },
};

export default function GraphPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get("keyword");

  const [elements, setElements] = useState<CytoscapeElements>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CytoscapeNodeData | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedNode(null);
    const url = keyword
      ? `/api/graph?keyword=${encodeURIComponent(keyword)}`
      : "/api/graph";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setElements(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [keyword]);

  function handleNodeClick(data: CytoscapeNodeData) {
    setSelectedNode(data);
  }

  function navigateToKeyword(kw: string) {
    router.push(`/graph?keyword=${encodeURIComponent(kw)}`);
    setSelectedNode(null);
  }

  const isEmpty = !loading && elements.nodes.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Network className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">키워드 그래프</h1>
          {keyword && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">·</span>
              <Badge variant="green">{keyword}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => router.push("/graph")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {Object.entries(NODE_LABELS).map(([type, { label, color }]) => (
            <span key={type} className={`px-2 py-1 rounded-full font-medium ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-400">그래프 데이터 로딩 중...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-gray-50 rounded-lg border gap-3">
            <Network className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-400">
              아직 데이터가 없습니다. 아이디어를 먼저 입력해주세요.
            </p>
          </div>
        ) : (
          <GraphViewer
            elements={elements}
            onNodeClick={handleNodeClick}
            height="600px"
          />
        )}

        {/* Node detail panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 z-20">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mb-1 ${
                        NODE_LABELS[selectedNode.type]?.color ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {NODE_LABELS[selectedNode.type]?.label ?? selectedNode.type}
                    </div>
                    <p className="font-semibold text-sm">{selectedNode.label}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-1 -mt-1"
                    onClick={() => setSelectedNode(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {selectedNode.type === "keyword" && (
                  <div className="space-y-2">
                    {selectedNode.category && (
                      <p className="text-xs text-gray-500">분류: {selectedNode.category}</p>
                    )}
                    <Button
                      size="sm"
                      className="w-full text-xs gap-1"
                      onClick={() => navigateToKeyword(selectedNode.label)}
                    >
                      <Network className="h-3 w-3" />이 키워드 중심으로 보기
                    </Button>
                  </div>
                )}

                {selectedNode.type === "idea" && selectedNode.ideaId && (
                  <div className="space-y-2">
                    {selectedNode.ideaDate && (
                      <p className="text-xs text-gray-500">{selectedNode.ideaDate}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs gap-1"
                      onClick={() => router.push(`/ideas/${selectedNode.ideaId}`)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      아이디어 상세 보기
                    </Button>
                  </div>
                )}

                {selectedNode.type === "company" && (
                  <div className="space-y-1 text-xs text-gray-600">
                    {selectedNode.ticker && (
                      <p>
                        티커: <span className="font-mono font-medium">{selectedNode.ticker}</span>
                        {selectedNode.exchange && ` · ${selectedNode.exchange}`}
                      </p>
                    )}
                    {selectedNode.ideaId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs gap-1 mt-2"
                        onClick={() => router.push(`/ideas/${selectedNode.ideaId}`)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        관련 아이디어 보기
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        노드를 클릭하면 상세 정보를 볼 수 있습니다. 스크롤로 줌 인/아웃, 드래그로 이동.
      </p>
    </div>
  );
}
