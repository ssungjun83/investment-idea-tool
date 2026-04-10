export type NodeType = "idea" | "keyword" | "company" | "effect";

export interface CytoscapeNodeData {
  id: string;
  type: NodeType;
  label: string;
  ideaDate?: string;
  category?: string;
  ticker?: string;
  exchange?: string;
  magnitude?: string;
  ideaId?: number;
  size?: number;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  edgeType:
    | "idea-keyword"
    | "keyword-keyword"
    | "idea-company"
    | "keyword-company";
  weight: number;
  ideaId?: number;
}

export interface CytoscapeElements {
  nodes: { data: CytoscapeNodeData }[];
  edges: { data: CytoscapeEdgeData }[];
}
