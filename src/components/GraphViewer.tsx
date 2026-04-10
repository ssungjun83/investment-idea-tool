"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CytoscapeElements, CytoscapeNodeData } from "@/types/graph";

interface Props {
  elements: CytoscapeElements;
  onNodeClick?: (data: CytoscapeNodeData) => void;
  onNodeDoubleClick?: (data: CytoscapeNodeData) => void;
  visibleTypes?: Set<string>;
  height?: string;
}

export default function GraphViewer({
  elements,
  onNodeClick,
  onNodeDoubleClick,
  visibleTypes,
  height = "600px",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  const onNodeClickRef = useRef(onNodeClick);
  const onNodeDoubleClickRef = useRef(onNodeDoubleClick);
  onNodeClickRef.current = onNodeClick;
  onNodeDoubleClickRef.current = onNodeDoubleClick;

  // 노드 타입 필터링
  useEffect(() => {
    if (!cyRef.current || !visibleTypes) return;
    const cy = cyRef.current as { nodes: (sel?: string) => { forEach: (fn: (n: { data: (k: string) => string; show: () => void; hide: () => void; connectedEdges: () => { show: () => void; hide: () => void } }) => void) => void } };
    cy.nodes().forEach((n) => {
      const type = n.data("type");
      if (visibleTypes.has(type)) {
        n.show();
      } else {
        n.hide();
        n.connectedEdges().hide();
      }
    });
  }, [visibleTypes]);

  useEffect(() => {
    async function init() {
      if (!containerRef.current) return;

      const cytoscape = (await import("cytoscape")).default;
      try {
        const fcose = (await import("cytoscape-fcose")).default;
        cytoscape.use(fcose);
      } catch {
        // fallback to cose
      }

      // 노드 degree 기반 크기 계산
      const degreeMap = new Map<string, number>();
      for (const e of elements.edges) {
        degreeMap.set(e.data.source, (degreeMap.get(e.data.source) ?? 0) + 1);
        degreeMap.set(e.data.target, (degreeMap.get(e.data.target) ?? 0) + 1);
      }

      const allNodes = elements.nodes.map((n) => {
        const degree = degreeMap.get(n.data.id) ?? 0;
        const baseSize = n.data.type === "keyword" ? 24 : n.data.type === "idea" ? 20 : 18;
        const dynamicSize = Math.min(baseSize + degree * 3, 70);
        return { data: { ...n.data, size: dynamicSize, degree } };
      });

      const allEdges = elements.edges.map((e) => ({
        data: { ...e.data },
      }));

      const cy = cytoscape({
        container: containerRef.current,
        elements: [...allNodes, ...allEdges],
        style: [
          // ─── 기본 노드 ───────────────────────
          {
            selector: "node",
            style: {
              label: "data(label)" as unknown as string,
              "text-valign": "bottom" as const,
              "text-halign": "center" as const,
              "text-margin-y": 4,
              "font-size": "10px",
              "font-family": "Noto Sans KR, sans-serif",
              "text-wrap": "ellipsis" as const,
              "text-max-width": "90px",
              color: "#374151",
              "text-outline-width": 2,
              "text-outline-color": "#fff",
              width: "data(size)",
              height: "data(size)",
              "overlay-opacity": 0,
              "transition-property": "opacity, border-width, border-color",
              "transition-duration": "200ms" as unknown as number,
            } as unknown as Record<string, unknown>,
          },
          {
            selector: 'node[type = "keyword"]',
            style: {
              shape: "diamond" as const,
              "background-color": "#10B981",
              "border-color": "#059669",
              "border-width": 2,
              "font-weight": "bold" as unknown as number,
            },
          },
          {
            selector: 'node[type = "idea"]',
            style: {
              shape: "ellipse" as const,
              "background-color": "#3B82F6",
              "border-color": "#2563EB",
              "border-width": 2,
            },
          },
          {
            selector: 'node[type = "company"]',
            style: {
              shape: "round-rectangle" as const,
              "background-color": "#F59E0B",
              "border-color": "#D97706",
              "border-width": 2,
            },
          },
          {
            selector: 'node[type = "effect"]',
            style: {
              shape: "hexagon" as const,
              "background-color": "#8B5CF6",
              "border-color": "#7C3AED",
              "border-width": 2,
            },
          },
          // ─── 엣지 ─────────────────────────────
          {
            selector: "edge",
            style: {
              width: "data(weight)",
              "line-color": "#CBD5E1",
              "target-arrow-color": "#CBD5E1",
              "target-arrow-shape": "triangle" as const,
              "curve-style": "bezier" as const,
              opacity: 0.5,
              "transition-property": "opacity, line-color",
              "transition-duration": "200ms" as unknown as number,
            } as unknown as Record<string, unknown>,
          },
          {
            selector: 'edge[edgeType = "keyword-keyword"]',
            style: {
              "line-color": "#6EE7B7",
              "target-arrow-shape": "none" as const,
              "target-arrow-color": "#6EE7B7",
              opacity: 0.6,
            },
          },
          {
            selector: 'edge[edgeType = "idea-keyword"]',
            style: {
              "line-color": "#93C5FD",
              "line-style": "dashed" as const,
              "target-arrow-color": "#93C5FD",
              opacity: 0.4,
            },
          },
          {
            selector: 'edge[edgeType = "idea-company"]',
            style: {
              "line-color": "#FCD34D",
              "line-style": "dotted" as const,
              "target-arrow-color": "#FCD34D",
              opacity: 0.4,
            },
          },
          {
            selector: 'edge[edgeType = "idea-effect"]',
            style: {
              "line-color": "#C4B5FD",
              "line-style": "dashed" as const,
              "target-arrow-color": "#C4B5FD",
              opacity: 0.35,
            },
          },
          // ─── 호버/선택 하이라이트 ──────────────
          {
            selector: "node.highlighted",
            style: {
              "border-width": 4,
              "border-color": "#1D4ED8",
              opacity: 1,
              "z-index": 999,
            } as unknown as Record<string, unknown>,
          },
          {
            selector: "node.faded",
            style: { opacity: 0.15 },
          },
          {
            selector: "edge.highlighted",
            style: { opacity: 1, width: 3, "z-index": 998 } as unknown as Record<string, unknown>,
          },
          {
            selector: "edge.faded",
            style: { opacity: 0.06 },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": 4,
              "border-color": "#1D4ED8",
            },
          },
        ] as unknown as cytoscape.StylesheetCSS[],
        layout: {
          name: "cose",
          animate: true,
          animationDuration: 1000,
          nodeRepulsion: () => 500000,
          idealEdgeLength: () => 120,
          gravity: 0.3,
          nestingFactor: 1.2,
          fit: true,
          padding: 40,
        } as unknown as { name: string },
        wheelSensitivity: 0.3,
        minZoom: 0.15,
        maxZoom: 5,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cyAny = cy as any;

      // ── 호버 하이라이트: 연결된 노드만 밝게, 나머지 흐리게 ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cyAny.on("mouseover", "node", (e: any) => {
        const node = e.target;
        const neighborhood = node.neighborhood().add(node);
        cyAny.elements().addClass("faded");
        neighborhood.addClass("highlighted");
        neighborhood.removeClass("faded");
        node.connectedEdges().addClass("highlighted");
        node.connectedEdges().removeClass("faded");
      });

      cyAny.on("mouseout", "node", () => {
        cyAny.elements().removeClass("faded").removeClass("highlighted");
      });

      // ── 클릭 ──
      cyAny.on("tap", "node", (e: { target: { data: () => CytoscapeNodeData } }) => {
        onNodeClickRef.current?.(e.target.data());
      });

      // ── 더블클릭: 키워드 노드면 해당 키워드 중심 그래프로 이동 ──
      cyAny.on("dbltap", "node", (e: { target: { data: () => CytoscapeNodeData } }) => {
        onNodeDoubleClickRef.current?.(e.target.data());
      });

      cyRef.current = cy;
      setReady(true);
    }

    init();

    return () => {
      if (cyRef.current) {
        (cyRef.current as { destroy: () => void }).destroy();
        cyRef.current = null;
      }
    };
  }, [elements]);

  return (
    <div className="relative" style={{ height }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-sm text-gray-500 animate-pulse">그래프 로딩 중...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full rounded-lg border bg-gradient-to-br from-gray-50 to-slate-50" />
    </div>
  );
}
