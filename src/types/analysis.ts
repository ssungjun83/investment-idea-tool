export interface Stage1 {
  theme: string;
  background: string;
  mechanism: string;
  timeline: string;
  risk_factors: string[];
}

export interface Stage2Effect {
  effect_order: number;
  category: string;
  description: string;
  magnitude: "상" | "중" | "하";
}

export interface Stage3Company {
  company_name: string;
  ticker: string | null;
  exchange: string | null;
  sector: string;
  reason: string;
  benefit_type: "직접수혜" | "간접수혜" | "공급망수혜";
  confidence: "높음" | "보통" | "낮음";
}

export interface AnalysisResult {
  title: string;
  stage1: Stage1;
  stage2: Stage2Effect[];
  stage3: Stage3Company[];
}

export interface IdeaDetail {
  idea: {
    id: number;
    raw_input: string;
    title: string;
    created_at: string;
  };
  stage1: Stage1 & { id: number; idea_id: number };
  stage2: (Stage2Effect & { id: number; idea_id: number })[];
  stage3: (Stage3Company & { id: number; idea_id: number })[];
  keywords: { id: number; name: string; category: string }[];
}

export interface RelatedIdea {
  id: number;
  title: string;
  created_at: string;
  overlap: number;
  shared_keywords: string[];
}

export interface IdeaListItem {
  id: number;
  title: string;
  raw_input: string;
  created_at: string;
  keywords: string[];
  company_count: number;
}
