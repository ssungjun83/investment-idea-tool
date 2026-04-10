import { z } from "zod";
import type { AnalysisResult } from "@/types/analysis";

const Stage1Schema = z.object({
  theme: z.string(),
  background: z.string(),
  mechanism: z.string(),
  timeline: z.string(),
  risk_factors: z.array(z.string()),
});

const Stage2Schema = z.object({
  effect_order: z.number(),
  category: z.string(),
  description: z.string(),
  magnitude: z.enum(["상", "중", "하"]),
});

const Stage3Schema = z.object({
  company_name: z.string(),
  ticker: z.string().nullable(),
  exchange: z.string().nullable(),
  sector: z.string(),
  reason: z.string(),
  benefit_type: z.enum(["직접수혜", "간접수혜", "공급망수혜"]),
  confidence: z.enum(["높음", "보통", "낮음"]),
});

const AnalysisSchema = z.object({
  title: z.string(),
  stage1: Stage1Schema,
  stage2: z.array(Stage2Schema),
  stage3: z.array(Stage3Schema),
});

export function parseAnalysisResponse(raw: string): AnalysisResult {
  // Try direct parse first
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    // Extract first JSON object with balanced brace matching
    const start = raw.indexOf("{");
    if (start === -1) throw new Error("응답에서 JSON을 찾을 수 없습니다.");

    let depth = 0;
    let end = -1;
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) throw new Error("JSON 파싱 실패: 괄호가 닫히지 않음");

    try {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } catch {
      throw new Error("JSON 파싱 실패: 잘못된 형식");
    }
  }

  const result = AnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`분석 결과 검증 실패: ${result.error.message}`);
  }
  return result.data;
}
