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

/**
 * 잘린 JSON 문자열을 자동 복구 시도
 * - 닫히지 않은 문자열을 닫고
 * - 닫히지 않은 배열/객체 괄호를 추가
 */
function repairTruncatedJson(raw: string): string {
  let s = raw.trim();

  // 마지막 불완전한 키-값 쌍 제거 (잘린 문자열)
  s = s.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, "");
  s = s.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, "");
  // 불완전한 객체 제거
  s = s.replace(/,\s*\{[^}]*$/, "");

  // 닫히지 않은 문자열 닫기
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (s[i] === "\\") { escaped = true; continue; }
    if (s[i] === '"') { inString = !inString; }
  }
  if (inString) s += '"';

  // 닫히지 않은 괄호 카운트 후 추가
  const stack: string[] = [];
  inString = false;
  escaped = false;
  for (let i = 0; i < s.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (s[i] === "\\") { escaped = true; continue; }
    if (s[i] === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (s[i] === "{") stack.push("}");
    else if (s[i] === "[") stack.push("]");
    else if (s[i] === "}" || s[i] === "]") stack.pop();
  }

  // 역순으로 닫기
  while (stack.length > 0) {
    s += stack.pop();
  }

  return s;
}

export function parseAnalysisResponse(raw: string): AnalysisResult {
  // Try direct parse first
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    // Extract JSON object
    const start = raw.indexOf("{");
    if (start === -1) throw new Error("응답에서 JSON을 찾을 수 없습니다.");

    let jsonStr = raw.slice(start);

    // 1차: balanced brace matching
    let depth = 0;
    let end = -1;
    for (let i = 0; i < jsonStr.length; i++) {
      if (jsonStr[i] === "{") depth++;
      else if (jsonStr[i] === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end !== -1) {
      // 정상적으로 닫힌 경우
      try {
        parsed = JSON.parse(jsonStr.slice(0, end + 1));
      } catch {
        throw new Error("JSON 파싱 실패: 잘못된 형식");
      }
    } else {
      // 잘린 JSON → 자동 복구 시도
      console.warn("[parser] JSON이 잘림 — 자동 복구 시도");
      const repaired = repairTruncatedJson(jsonStr);
      try {
        parsed = JSON.parse(repaired);
      } catch {
        throw new Error("JSON 파싱 실패: 응답이 잘렸습니다. 다시 시도해주세요.");
      }
    }
  }

  // Zod 검증 — 잘린 데이터도 최대한 수용
  const result = AnalysisSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  // stage3가 잘렸을 수 있음 — 부분 데이터라도 살리기
  const partial = parsed as Record<string, unknown>;
  if (partial.title && partial.stage1) {
    const s1 = Stage1Schema.safeParse(partial.stage1);
    const s2 = Array.isArray(partial.stage2)
      ? partial.stage2.filter((e: unknown) => Stage2Schema.safeParse(e).success).map((e: unknown) => Stage2Schema.parse(e))
      : [];
    const s3 = Array.isArray(partial.stage3)
      ? partial.stage3.filter((c: unknown) => Stage3Schema.safeParse(c).success).map((c: unknown) => Stage3Schema.parse(c))
      : [];

    if (s1.success) {
      return {
        title: String(partial.title),
        stage1: s1.data,
        stage2: s2,
        stage3: s3,
      };
    }
  }

  throw new Error(`분석 결과 검증 실패: ${result.error.message}`);
}
