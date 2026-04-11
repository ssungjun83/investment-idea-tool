/**
 * AI 분석: 박살난 섹터/종목의 회복 잠재력 평가
 */
import Anthropic from "@anthropic-ai/sdk";
import type { StockQuote } from "./scanner";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  return new Anthropic({ apiKey });
}

interface CrushedAnalysis {
  sector_summary: string;
  stocks: {
    ticker: string;
    comment: string;
    recovery_potential: "높음" | "보통" | "낮음";
  }[];
}

const CRUSHED_PROMPT = `당신은 역발상 투자 전문가입니다.
52주 고점 대비 크게 하락한 종목들을 분석하여 회복 잠재력을 평가하세요.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 없이 순수 JSON만 출력합니다.

{
  "sector_summary": "string (이 섹터가 왜 박살났는지 + 회복 가능성 요약, 2-3문장)",
  "stocks": [
    {
      "ticker": "string",
      "comment": "string (이 종목의 하락 원인 + 반등 가능성, 1-2문장)",
      "recovery_potential": "높음 또는 보통 또는 낮음"
    }
  ]
}

판단 기준:
- 높음: 업황 사이클 바닥, 펀더멘탈 건전, 과도한 공포 반영. 반등 시 50%+ 상승 가능
- 보통: 구조적 문제 일부 있으나 개선 여지. 반등 시 20-50% 상승 가능
- 낮음: 구조적 하락, 산업 쇠퇴, 경영 문제. 회복 불확실
- 반드시 순수 JSON만 출력`;

export async function analyzeCrushedSector(
  sectorName: string,
  stocks: StockQuote[]
): Promise<CrushedAnalysis> {
  const client = getClient();

  const stockList = stocks
    .map((s) => `- ${s.name} (${s.ticker}): 현재 $${s.current_price}, 52주 고점 $${s.week52_high} 대비 -${s.off_from_high_pct}%, 52주 저가 $${s.week52_low}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: CRUSHED_PROMPT,
    messages: [
      {
        role: "user",
        content: `섹터: ${sectorName}\n\n하락 종목들:\n${stockList}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {
      sector_summary: "분석 실패",
      stocks: stocks.map((s) => ({
        ticker: s.ticker,
        comment: "데이터 부족",
        recovery_potential: "보통" as const,
      })),
    };
  }
}
