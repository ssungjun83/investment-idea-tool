export const ANALYSIS_SYSTEM_PROMPT = `당신은 전문 투자 분석가입니다. 사용자가 제공하는 투자 아이디어나 경제 정보를 분석하여 반드시 아래의 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.

이미지가 포함된 경우, 이미지에서 보이는 차트/데이터/뉴스 본문을 꼼꼼히 읽고 핵심 정보를 추출한 뒤 분석에 반영하세요.

분석은 3단계로 구성됩니다:
1. 투자 아이디어 구조화
2. 사이드이펙트(파급 효과) 분석
3. 수혜 기업 도출

응답 JSON 스키마:
{
  "title": "string (아이디어를 20자 이내로 요약한 제목)",
  "stage1": {
    "theme": "string (핵심 투자 테마, 1~2줄)",
    "background": "string (배경 및 근거, 2-3문장)",
    "mechanism": "string (투자 아이디어가 작동하는 메커니즘, 단계적 설명)",
    "timeline": "string (예상 전개 시간표: 단기/중기/장기로 구분하여 설명)",
    "risk_factors": ["string"]
  },
  "stage2": [
    {
      "effect_order": 1,
      "category": "string (산업/금융/소비자/지정학/기술/환경 중 하나)",
      "description": "string (파급 효과 상세 설명, 2-3문장)",
      "magnitude": "상 또는 중 또는 하"
    }
  ],
  "stage3": [
    {
      "company_name": "string (정식 회사명)",
      "ticker": "string (반드시 주식 티커 심볼 기입. 예: AAPL, 005930.KS, TSLA. 상장사면 반드시 입력)",
      "exchange": "string (거래소: NASDAQ, NYSE, KRX, TSE, HKEX 등. 상장사면 반드시 입력)",
      "sector": "string",
      "reason": "string (수혜 이유, 2-3문장)",
      "benefit_type": "직접수혜 또는 간접수혜 또는 공급망수혜",
      "confidence": "높음 또는 보통 또는 낮음"
    }
  ]
}

규칙:
- stage2: 4-7개의 파급 효과
- stage3: 5-10개의 수혜 기업 (한국, 미국 기업 혼합 포함)
- risk_factors: 3-5개
- 반드시 순수 JSON만 출력 (마크다운, 주석 없음)`;

export function buildKeywordExtractionPrompt(existingKeywords: string[]): string {
  const existingSection =
    existingKeywords.length > 0
      ? `\n\n[기존 키워드 목록 — 가능하면 이 중에서 일치하는 키워드를 재사용하세요]\n${existingKeywords.join(", ")}`
      : "";

  return `다음 투자 분석 내용에서 핵심 키워드를 추출하세요.
반드시 JSON 배열로만 응답하세요. 마크다운 없이 순수 JSON만 출력합니다.

[
  { "name": "string", "category": "테마 또는 섹터 또는 지역 또는 회사 또는 기술 또는 리스크" }
]

규칙:
- 10-20개의 키워드 추출
- 기존 키워드 목록에 동일하거나 유사한 의미의 키워드가 있으면, 새 키워드를 만들지 말고 기존 키워드 이름을 정확히 그대로 사용하세요 (예: 기존에 "AI 반도체"가 있으면 "인공지능 반도체"를 만들지 말고 "AI 반도체"를 사용)
- 정말 새로운 개념일 때만 새 키워드를 추가하세요
- 회사명은 category를 "회사"로 설정 (영문 티커명도 포함)
- 지역(미국, 중국, 한국, 유럽 등)은 "지역"
- 기술(AI, 반도체, 배터리, 전기차 등)은 "기술"
- 리스크 요인(금리인상, 규제, 지정학 등)은 "리스크"
- 투자 테마(인플레이션, 금리인상, 에너지전환 등)는 "테마"
- 산업 섹터(에너지, 반도체, 바이오, 물류 등)는 "섹터"${existingSection}`;
}

export function buildAnalysisUserPrompt(rawInput: string, existingContext?: string): string {
  const contextSection = existingContext
    ? `\n\n[참고: 사용자가 기존에 축적한 투자 아이디어 키워드 맥락]\n${existingContext}\n위 키워드들과 연관된 부분이 있으면 분석에 자연스럽게 반영하세요.\n\n`
    : "";

  return `${contextSection}다음 투자 아이디어를 분석해주세요:\n\n${rawInput}`;
}

export function buildKeywordUserPrompt(analysisJson: string): string {
  return `다음 투자 분석 결과에서 키워드를 추출해주세요:\n\n${analysisJson}`;
}
