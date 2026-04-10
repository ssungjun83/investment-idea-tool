"use client";

import { useEffect, useRef, useState } from "react";
import type { CytoscapeElements, CytoscapeNodeData } from "@/types/graph";

interface Props {
  elements: CytoscapeElements;
  onNodeClick?: (data: CytoscapeNodeData) => void;
  height?: string;
}

const NODE_COLORS = {
  keyword: { bg: "#10B981", border: "#059669", text: "#fff" },
  idea: { bg: "#3B82F6", border: "#2563EB", text: "#fff" },
  company: { bg: "#F59E0B", border: "#D97706", text: "#fff" },
  effect: { bg: "#8B5CF6", border: "#7C3AED", text: "#fff" },
};

export default function GraphViewer({ elements, onNodeClick, height = "600px" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cy: unknown;

    async function init() {
      if (!containerRef.current) return;

      const cytoscape = (await import("cytoscape")).default;

      // Try to load fcose layout
      try {
        const fcose = (await import("cytoscape-fcose")).default;
        cytoscape.use(fcose);
      } catch {
        // fcose not available, use default cose
      }

      const allNodes = elements.nodes.map((n) => ({
        data: { ...n.data },
      }));
      const allEdges = elements.edges.map((e) => ({
        data: { ...e.data },
      }));

      cy = cytoscape({
        container: containerRef.current,
        elements: [...allNodes, ...allEdges],
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)" as unknown as string,
              "text-valign": "center" as const,
              "text-halign": "center" as const,
              "font-size": "11px",
              "font-family": "Noto Sans KR, sans-serif",
              "text-wrap": "wrap" as const,
              "text-max-width": "80px",
              color: "#fff",
              "text-outline-width": 1,
              "text-outline-color": "#333",
              width: "data(size)",
              height: "data(size)",
            },
          },
          {
            selector: 'node[type = "keyword"]',
            style: {
              shape: "diamond" as const,
              "background-color": NODE_COLORS.keyword.bg,
              "border-color": NODE_COLORS.keyword.border,
              "border-width": 2,
            },
          },
          {
            selector: 'node[type = "idea"]',
            style: {
              shape: "ellipse" as const,
              "background-color": NODE_COLORS.idea.bg,
              "border-color": NODE_COLORS.idea.border,
              "border-width": 2,
            },
          },
          {
            selector: 'node[type = "company"]',
            style: {
              shape: "round-rectangle" as const,
              "background-color": NODE_COLORS.company.bg,
              "border-color": NODE_COLORS.company.border,
              "border-width": 2,
            },
          },
          {
            selector: 'node[type = "effect"]',
            style: {
              shape: "hexagon" as const,
              "background-color": NODE_COLORS.effect.bg,
              "border-color": NODE_COLORS.effect.border,
              "border-width": 2,
            },
          },
          {
            selector: "edge",
            style: {
              width: "data(weight)",
              "line-color": "#CBD5E1",
              "target-arrow-color": "#CBD5E1",
              "target-arrow-shape": "triangle" as const,
              "curve-style": "bezier" as const,
              opacity: 0.7,
            },
          },
          {
            selector: 'edge[edgeType = "keyword-keyword"]',
            style: {
              "line-color": "#86EFAC",
              "target-arrow-color": "#86EFAC",
            },
          },
          {
            selector: 'edge[edgeType = "idea-keyword"]',
            style: {
              "line-color": "#93C5FD",
              "line-style": "dashed" as const,
              "target-arrow-color": "#93C5FD",
            },
          },
          {
            selector: 'edge[edgeType = "idea-company"]',
            style: {
              "line-color": "#FCD34D",
              "line-style": "dotted" as const,
              "target-arrow-color": "#FCD34D",
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": 4,
              "border-color": "#1D4ED8",
            },
          },
        ],
        layout: {
          name: "cose",
          animate: true,
          animationDuration: 800,
          nodeRepulsion: () => 400000,
          idealEdgeLength: () => 100,
          fit: true,
          padding: 30,
        } as unknown as { name: string },
        wheelSensitivity: 0.3,
        minZoom: 0.2,
        maxZoom: 4,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cy as any).on("tap", "node", (e: { target: { data: () => CytoscapeNodeData } }) => {
        const data = e.target.data() as CytoscapeNodeData;
        onNodeClick?.(data);
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
  }, [elements, onNodeClick]);

  return (
    <div className="relative" style={{ height }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-sm text-gray-500">그래프 로딩 중...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full rounded-lg border bg-gray-50" />
    </div>
  );
}
