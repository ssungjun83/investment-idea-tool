/**
 * AI를 이용한 지표 분석 + 전망 생성
 */
import Anthropic from "@anthropic-ai/sdk";
import type { NewsItem } from "./news";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  return new Anthropic({ apiKey });
}

export interface IndicatorAnalysis {
  direction: "up" | "down" | "neutral";
  sentiment_score: number; // -100 ~ 100
  summary: string;
  forecast: string;
  forecast_confidence: "높음" | "보통" | "낮음";
}

const INDICATOR_ANALYSIS_PROMPT = `당신은 글로벌 매크로 전문 분석가입니다.
주어진 지표에 대한 최신 뉴스와 사용자의 투자 분석 컨텍스트를 종합하여 현재 상황과 향후 전망을 분석하세요.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 없이 순수 JSON만 출력합니다.

{
  "direction": "up 또는 down 또는 neutral (현재 방향성)",
  "sentiment_score": "숫자 (-100~100. 매우 부정적=-100, 중립=0, 매우 긍정적=100)",
  "summary": "string (현재 상황 요약, 2-3문장. 핵심 수치/데이터 포함)",
  "forecast": "string (향후 1-3개월 전망, 2-3문장. 구체적 시나리오 포함)",
  "forecast_confidence": "높음 또는 보통 또는 낮음"
}

규칙:
- direction: 해당 지표의 가격/수치가 상승 추세면 "up", 하락이면 "down", 횡보면 "neutral"
- sentiment_score: 투자자 관점에서의 시장 심리. 긍정적 전망이면 양수, 부정적이면 음수
- summary: 뉴스에서 추출한 핵심 팩트 기반. 구체적 숫자가 있으면 포함
- forecast: 사용자가 제공한 투자 아이디어 컨텍스트를 반드시 반영하여 전망. 사용자 컨텍스트의 가중치를 높게 반영
- 반드시 순수 JSON만 출력`;

export async function analyzeIndicator(
  indicatorName: string,
  news: NewsItem[],
  userIdeasContext: string | null
): Promise<IndicatorAnalysis> {
  const client = getClient();

  const newsSection = news.length > 0
    ? `\n\n[최신 뉴스 (${news.length}건)]\n${news.map((n, i) =>
        `${i + 1}. [${n.date}] ${n.title} (${n.source})`
      ).join("\n")}`
    : "\n\n[최신 뉴스 없음]";

  const userSection = userIdeasContext
    ? `\n\n[사용자 투자 분석 컨텍스트 — 이 정보를 특히 중요하게 반영하세요 (가중치 2배)]\n${userIdeasContext}`
    : "";

  const userPrompt = `다음 지표를 분석해주세요: "${indicatorName}"${newsSection}${userSection}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: INDICATOR_ANALYSIS_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {
      direction: "neutral",
      sentiment_score: 0,
      summary: "분석 실패",
      forecast: "데이터 부족",
      forecast_confidence: "낮음",
    };
  }
}

/**
 * 사용자 투자 아이디어에서 특정 지표 관련 컨텍스트 추출
 */
export function buildUserContext(
  indicatorName: string,
  ideaData: { title: string; theme: string | null; background: string | null }[]
): string | null {
  if (ideaData.length === 0) return null;

  const relevant = ideaData.filter((idea) => {
    const text = `${idea.title} ${idea.theme ?? ""} ${idea.background ?? ""}`.toLowerCase();
    const nameTokens = indicatorName.toLowerCase().replace(/[()]/g, "").split(/[\s,]+/);
    return nameTokens.some((token) => token.length >= 2 && text.includes(token));
  });

  if (relevant.length === 0) return null;

  return relevant
    .map((idea) => `- ${idea.title}: ${idea.theme ?? ""} ${idea.background ?? ""}`.trim())
    .join("\n");
}
