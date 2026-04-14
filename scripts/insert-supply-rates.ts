import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertSupplyRates() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):
그리고 에너지는 딱 잘라서

"유가에 베팅? 유가가 오르고 내린다에 베팅하는건 멍청한짓"
-> 유가 선물시장은 얼마든지 조작이 가능하기때문에 여기에 베팅하는건 미친짓이니 하지마시고

1. 공급망 다변화 (장비 / 시추 / 강관)

2. 미국에서 실어오는 기간 (50~60일) vs 중동에서 실어오는 기간 (25일)
=> 해운의 운송 거리 증가 => 배 부족 => 배 발주 (조선)

3. 금리 인상이 예상되므로 고금리 수혜 회사들 (보험 은행 금융)`;

  const title = "에너지 투자 3원칙 — 공급망 다변화(장비·시추·강관) + 해운 톤마일 + 고금리 수혜(금융)";

  const [idea] = await sql`
    INSERT INTO ideas (raw_input, title) VALUES (${rawInput}, ${title}) RETURNING id
  `;
  const ideaId = idea.id as number;
  console.log(`✅ idea inserted: id=${ideaId}`);

  // ── 2. Stage 1 ──
  await sql`
    INSERT INTO stage1_idea (idea_id, theme, background, mechanism, timeline, risk_factors)
    VALUES (
      ${ideaId},
      ${"유가 방향 베팅 대신 구조적 수혜 — 공급망 다변화·해운 톤마일·고금리 수혜 3축 전략"},
      ${"유가 선물시장은 조작이 가능하므로 가격 방향에 직접 베팅하는 것은 비합리적. 대신 유가와 무관하게 작동하는 구조적 수혜 테마에 집중. ① 중동 의존 탈피로 미국·남미·서아프리카 중심 에너지 개발 → 장비·시추·강관 수요 확대. ② 미국산 원유·LNG 운송 거리가 중동 대비 2배 이상(50-60일 vs 25일) → 해운 톤마일 증가 → 선복 부족 → VLCC·LNG선 신규 발주 급증. ③ 인플레 지속·금리 인상 기조 → 순이자마진(NIM) 확대 → 은행·보험·금융 섹터 수혜."},
      ${"1) 유가 선물 조작 가능성 → 방향 베팅 비효율 → 구조적 수혜주로 포지셔닝 → 2) 공급망 다변화: 장비(BKR·SLB·FTI), 시추(RIG·HP), 강관(넥스틸·세아제강·Tenaris) → 3) 운송 거리 증가: 미국(50-60일) vs 중동(25일) → 톤마일 2.4배 증가 → 선복 부족 → VLCC 발주 → 한국 조선 3사 수혜 → 4) 고금리 지속: 은행 NIM 개선, 보험사 운용수익 확대, 금융 섹터 리레이팅"},
      ${"단기(1-3개월): 강관·장비 수주 모멘텀 확인, 금융주 NIM 방어 확인. 중기(3-6개월): VLCC·LNG선 발주 본격화로 조선 수주 확대 반영. 해운 운임 상승. 장기(6-12개월): 미국 에너지 수출 인프라 확장과 금리 고점 구간 유지 시 금융 섹터 재평가."},
      ${JSON.stringify([
        "유가 급락 시 E&P 투자 축소로 장비·시추 수요 위축",
        "금리 인하 전환 시 금융 섹터 NIM 압박",
        "중국 조선사 저가 공세로 한국 수주 단가 압박",
        "미국 LNG·원유 수출 규제 강화 가능성",
        "해운 운임 급락 시 선박 발주 연기",
        "경기 침체 시 에너지 물동량 감소"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2 ──
  const effects = [
    { order: 1, category: "산업", description: "공급망 다변화 테마 — 중동 의존 탈피로 미국·남미·서아프리카 E&P 투자 확대. 유전 장비(BKR·SLB·FTI)·시추(RIG·HP)·OCTG 강관 수요 증가.", magnitude: "상" },
    { order: 2, category: "산업", description: "운송 거리 증가 → 해운 톤마일 확대. 미국 50-60일 vs 중동 25일 기준 선복 수요 약 2.4배 증가. VLCC·LNG선 운임 강세.", magnitude: "상" },
    { order: 3, category: "산업", description: "선복 부족 → 신규 선박 발주. 노후선 교체와 톤마일 증가 겹쳐 한국 조선 3사 수주 모멘텀 지속.", magnitude: "상" },
    { order: 4, category: "금융", description: "고금리 기조 유지 → 은행 순이자마진(NIM) 확대. 보험사 채권 운용수익률 개선. 금융 섹터 전반 리레이팅.", magnitude: "상" },
    { order: 5, category: "산업", description: "강관(OCTG) 수요 확대 — 미국 셰일·deepwater 시추 활성화로 케이싱·라이저 파이프 발주 증가. 한국·남미 강관 업체 수혜.", magnitude: "중" },
    { order: 6, category: "금융", description: "고금리 구간 장기화 시 자산운용·브로커리지 수익 확대. 금융지주 배당 매력 부각.", magnitude: "중" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3 (NYSE/NASDAQ/KRX만) ──
  const companies = [
    // 1) 공급망 다변화 — 장비/시추/강관
    { name: "Baker Hughes", ticker: "BKR", exchange: "NASDAQ", sector: "유전 서비스·장비", reason: "장비·LNG 기자재 동시 강점. 공급망 다변화로 미국·남미·서아프리카 프로젝트 전 영역 수주 확대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "SLB (Schlumberger)", ticker: "SLB", exchange: "NYSE", sector: "유전 서비스", reason: "세계 최대 유전 서비스 기업. 중동 외 지역 개발 가속화 시 기술 서비스 수주 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "TechnipFMC", ticker: "FTI", exchange: "NYSE", sector: "해양 장비", reason: "subsea 장비 세계 1위. deepwater 개발 확대로 아프리카·남미 프로젝트 수주 백로그 확대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Transocean", ticker: "RIG", exchange: "NYSE", sector: "심해 시추", reason: "심해 시추선(드릴십) 최대 운영사. 공급망 다변화 지역 시추 수요 증가로 용선료 상승 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Helmerich & Payne", ticker: "HP", exchange: "NYSE", sector: "육상 시추", reason: "미국 최대 육상 시추 리그 운영사. 미국 셰일 시추 재활성화 시 리그 가동률·일당 상승.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Tenaris", ticker: "TS", exchange: "NYSE", sector: "OCTG 강관", reason: "세계 최대 OCTG(유정용) 강관 제조사. 시추 활성화로 케이싱·라이저 파이프 수요 급증.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "넥스틸", ticker: "286940.KS", exchange: "KRX", sector: "강관 제조", reason: "한국 대표 OCTG 강관 기업. 미국 시추 수요 증가에 따른 수출 확대 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "세아제강", ticker: "306200.KS", exchange: "KRX", sector: "강관 제조", reason: "에너지용 강관 주력. 미국 E&P 투자 확대로 강관 수출 물량 증가.", benefit_type: "직접수혜", confidence: "높음" },

    // 2) 해운 + 조선 (톤마일 증가)
    { name: "Frontline", ticker: "FRO", exchange: "NYSE", sector: "VLCC 해운", reason: "세계 최대 VLCC 운영사. 미국발 장거리 원유 운송 증가로 톤마일·운임 동반 상승.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "International Seaways", ticker: "INSW", exchange: "NYSE", sector: "VLCC·탱커 해운", reason: "VLCC·아프라막스 탱커 운영. 운송 거리 2배 이상 증가 시 선복 부족 수혜.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "VLCC·LNG선 세계 최고 건조 경쟁력. 선복 부족 → 신규 발주 사이클의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "LNG선·원유운반선 건조 정상급. 톤마일 증가 → 선복 부족 → 대형 발주로 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "VLCC·LNG선 건조 역량. 조선 슈퍼사이클 수주 확대 기대.", benefit_type: "직접수혜", confidence: "보통" },

    // 3) 고금리 수혜 — 은행·보험·금융
    { name: "JPMorgan Chase", ticker: "JPM", exchange: "NYSE", sector: "은행", reason: "미국 최대 상업·투자은행. 고금리 지속으로 순이자마진(NIM) 확대. 자산운용·트레이딩 수익도 동반 개선.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Bank of America", ticker: "BAC", exchange: "NYSE", sector: "은행", reason: "미국 2위 상업은행. 금리 민감도 높아 고금리 기조에서 NIM 개선 효과 가장 큼.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Wells Fargo", ticker: "WFC", exchange: "NYSE", sector: "은행", reason: "주택담보대출·상업대출 비중 높은 전통 상업은행. 고금리 수혜 대표주.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "MetLife", ticker: "MET", exchange: "NYSE", sector: "보험", reason: "미국 대형 생명보험사. 고금리로 채권 운용수익 대폭 개선. 보험 부채 할인율 상승 효과.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Prudential Financial", ticker: "PRU", exchange: "NYSE", sector: "보험", reason: "생명보험·연금·자산운용 종합. 고금리 장기화 시 전 사업부 수혜.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "KB금융", ticker: "105560.KS", exchange: "KRX", sector: "금융지주", reason: "한국 대표 금융지주. 고금리 기조에서 은행 NIM 개선 직접 수혜. 배당 매력도 부각.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "신한지주", ticker: "055550.KS", exchange: "KRX", sector: "금융지주", reason: "한국 2위 금융지주. 은행·카드·증권 종합으로 고금리 수혜 폭 넓음.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성생명", ticker: "032830.KS", exchange: "KRX", sector: "보험", reason: "한국 최대 생보사. 고금리 시 채권 운용수익과 신계약 예정이율 개선으로 수혜.", benefit_type: "직접수혜", confidence: "높음" },
  ];

  for (const co of companies) {
    await sql`
      INSERT INTO stage3_companies (idea_id, company_name, ticker, exchange, sector, reason, benefit_type, confidence)
      VALUES (${ideaId}, ${co.name}, ${co.ticker}, ${co.exchange}, ${co.sector}, ${co.reason}, ${co.benefit_type}, ${co.confidence})
    `;
  }
  console.log(`✅ stage3 inserted: ${companies.length}개`);

  // ── 5. 키워드 ──
  const kwList = [
    { name: "공급망 다변화", category: "테마" },
    { name: "유가 베팅", category: "테마" },
    { name: "OCTG 강관", category: "섹터" },
    { name: "강관", category: "섹터" },
    { name: "심해 시추", category: "테마" },
    { name: "육상 시추", category: "테마" },
    { name: "톤마일", category: "테마" },
    { name: "VLCC", category: "테마" },
    { name: "해운", category: "섹터" },
    { name: "조선", category: "섹터" },
    { name: "고금리", category: "테마" },
    { name: "NIM", category: "기술" },
    { name: "은행", category: "섹터" },
    { name: "보험", category: "섹터" },
    { name: "금융", category: "섹터" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
  ];

  const savedKwIds: number[] = [];
  for (const kw of kwList) {
    const existing = await sql`SELECT id FROM keywords WHERE LOWER(name) = LOWER(${kw.name}) LIMIT 1`;
    let kwId: number;
    if (existing.length > 0) {
      kwId = existing[0].id as number;
    } else {
      const [inserted] = await sql`INSERT INTO keywords (name, category) VALUES (${kw.name}, ${kw.category}) RETURNING id`;
      kwId = inserted.id as number;
    }
    savedKwIds.push(kwId);
    await sql`INSERT INTO idea_keywords (idea_id, keyword_id, source, weight) VALUES (${ideaId}, ${kwId}, 'manual', 1.0) ON CONFLICT DO NOTHING`;
  }
  console.log(`✅ keywords inserted: ${kwList.length}개`);

  // ── 6. 키워드 관계 ──
  for (let i = 0; i < savedKwIds.length; i++) {
    for (let j = i + 1; j < savedKwIds.length; j++) {
      const aId = savedKwIds[i];
      const bId = savedKwIds[j];
      await sql`
        INSERT INTO keyword_relations (keyword_a_id, keyword_b_id, idea_id, strength)
        VALUES (${aId}, ${bId}, ${ideaId}, 1.0)
        ON CONFLICT (keyword_a_id, keyword_b_id, idea_id) DO UPDATE SET strength = keyword_relations.strength + 0.5
      `;
      await sql`
        INSERT INTO keyword_relations (keyword_a_id, keyword_b_id, idea_id, strength)
        VALUES (${bId}, ${aId}, ${ideaId}, 1.0)
        ON CONFLICT (keyword_a_id, keyword_b_id, idea_id) DO UPDATE SET strength = keyword_relations.strength + 0.5
      `;
    }
  }
  console.log("✅ keyword relations inserted");

  console.log(`\n🎉 완료! 아이디어 ID: ${ideaId}`);
  console.log(`👉 https://investment-idea-tool.vercel.app/ideas/${ideaId}`);
}

insertSupplyRates().catch(console.error);
