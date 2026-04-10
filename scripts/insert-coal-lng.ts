import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertCoalLng() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 1분기 (1/12-4/10):
Newcastle Coal Futures 현재 $134.75/톤 수준으로 저점 부근.
2022년 우크라이나-러시아 전쟁 당시 톤당 $400 이상 역대 최대치 기록.
현재 따뜻한 봄이라 석탄 수요 저조하나, 여름·겨울 성수기에 가격 재상승 가능성.
LNG 가격 연동제이므로 여름·겨울 수요 증가 시 석탄도 동반 상승 전망.
가스 부족 시 석탄이 대체재 역할 (신재생으로 대체 불가).
전기 수요·난방 수요 성수기는 여름과 겨울.
석탄 운송 항로는 가스·석유와 달리 자유로움 — 아프리카/미국/호주가 메인이라 호르무즈 해협 리스크 없음.
수급도 자유로운 편.`;

  const title = "석탄 가격 저점 매수 기회 — LNG 연동 + 여름·겨울 성수기 수혜";

  const [idea] = await sql`
    INSERT INTO ideas (raw_input, title) VALUES (${rawInput}, ${title}) RETURNING id
  `;
  const ideaId = idea.id as number;
  console.log(`✅ idea inserted: id=${ideaId}`);

  // ── 2. Stage 1: 투자 아이디어 구조화 ──
  await sql`
    INSERT INTO stage1_idea (idea_id, theme, background, mechanism, timeline, risk_factors)
    VALUES (
      ${ideaId},
      ${"석탄 가격 저점 매수 — LNG 가격 연동 및 계절적 수요 증가 수혜 전망"},
      ${"뉴캐슬 석탄 선물(NCF) 가격이 $134.75/톤으로 저점 부근에 위치. 2022년 우크라이나-러시아 전쟁 당시 $400/톤을 넘긴 역대 최고치 대비 약 66% 하락한 수준이다. 현재 봄철이라 수요가 저조하지만, LNG 가격과 연동되는 구조이며, 여름(전기 수요)·겨울(난방 수요) 성수기가 다가오면 가격 회복이 기대된다. 석탄은 가스 부족 시 핵심 대체 에너지원이며, 운송 항로가 호르무즈 해협에 의존하지 않아 지정학적 리스크로부터 자유롭다."},
      ${"1) 석탄 가격 $134.75/톤으로 역사적 저점 부근 → 2) LNG 가격 연동제로 가스 가격 상승 시 석탄도 동반 상승 → 3) 여름·겨울 전기·난방 수요 성수기 진입 → 4) 가스 부족 시 석탄이 유일한 현실적 대체재 (신재생 대체 불가) → 5) 석탄 운송 항로(아프리카·미국·호주) 지정학 리스크 낮음 → 6) 수급 자유로워 가격 반등 시 빠른 공급 대응 가능"},
      ${"단기(1-3개월): 봄철 비수기로 추가 하락 또는 횡보 가능. 매수 기회. 중기(3-6개월): 여름 전기 수요 증가로 석탄 가격 반등 기대. LNG 가격 동반 상승 시 탄력 확대. 장기(6-12개월): 겨울 난방 수요까지 이어지면 가격 상당폭 회복 가능. 우크라이나 사태 미해결 시 2022년 수준 재도달 시나리오도 존재."},
      ${JSON.stringify([
        "글로벌 경기 침체로 에너지 수요 전반 감소",
        "신재생에너지 확대로 석탄 구조적 수요 감소 가속",
        "우크라이나-러시아 전쟁 조기 종결 시 에너지 가격 급락",
        "각국 탄소 규제 강화로 석탄 사용 제한",
        "호주·인도네시아 석탄 공급 과잉 지속 가능성",
        "LNG 가격 연동이 약화될 경우 석탄 독자 상승 제한"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "석탄 가격 저점에서 반등 시 석탄 채굴·생산 기업의 실적 대폭 개선. 미국·호주 석탄 기업이 직접 수혜.", magnitude: "상" },
    { order: 2, category: "산업", description: "LNG 가격 연동으로 가스 가격 상승 시 석탄 수요·가격 동반 상승. 석탄 화력발전 가동률 증가.", magnitude: "상" },
    { order: 3, category: "산업", description: "여름·겨울 전기·난방 수요 성수기에 발전용 석탄 소비 급증. 유틸리티 기업 원가 부담 증가.", magnitude: "중" },
    { order: 4, category: "산업", description: "석탄 운송(벌크 해운) 수요 증가. 아프리카·호주 출발 석탄 벌크선 운임 상승 기대.", magnitude: "중" },
    { order: 5, category: "금융", description: "석탄 선물·ETF 투자 수요 증가. 에너지 섹터 자금 유입으로 관련 종목 밸류에이션 재평가.", magnitude: "중" },
    { order: 6, category: "산업", description: "가스 부족 상황 장기화 시 석탄 의존도 재확대. ESG·탈탄소 정책과의 충돌 가능성.", magnitude: "하" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3: 수혜/피해 기업 ──
  const companies = [
    // 석탄 생산 (직접 수혜)
    { name: "Peabody Energy", ticker: "BTU", exchange: "NYSE", sector: "석탄", reason: "미국 최대 석탄 생산 기업. 뉴캐슬 석탄 가격 반등 시 가장 직접적인 수혜. 열탄·원료탄 모두 생산하며 호주 광산도 보유.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Arch Resources", ticker: "ARCH", exchange: "NYSE", sector: "석탄", reason: "미국 주요 석탄 생산업체. 원료탄(metallurgical coal) 비중이 높아 철강 수요와도 연동. 석탄 가격 반등 시 수익성 급개선.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "CONSOL Energy", ticker: "CEIX", exchange: "NYSE", sector: "석탄", reason: "미국 동부 석탄 생산·수출 기업. 볼티모어 항구를 통한 수출 인프라 보유. 국제 석탄 가격 상승 시 수출 마진 확대.", benefit_type: "직접수혜", confidence: "높음" },
    // 석탄 해운 (간접 수혜)
    { name: "Star Bulk Carriers", ticker: "SBLK", exchange: "NASDAQ", sector: "벌크 해운", reason: "드라이벌크 해운 대형주. 석탄 운송 수요 증가 시 벌크선 운임 상승으로 간접 수혜. 석탄 항로 자유로움이 강점.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "팬오션", ticker: "028670.KS", exchange: "KRX", sector: "벌크 해운", reason: "한국 대표 벌크 해운사. 석탄·철광석 등 벌크 화물 운송 주력. 석탄 운송량 증가 시 운임 수혜.", benefit_type: "간접수혜", confidence: "보통" },
    // 유틸리티 (피해 — 원가 부담)
    { name: "한국전력", ticker: "015760.KS", exchange: "KRX", sector: "전력", reason: "석탄 화력발전 비중이 높아 석탄 가격 상승 시 연료비 부담 직접 증가. 전기요금 인상이 동반되지 않으면 적자 확대 우려.", benefit_type: "피해", confidence: "높음" },
    { name: "Duke Energy", ticker: "DUK", exchange: "NYSE", sector: "전력", reason: "미국 대형 유틸리티. 석탄 화력 비중 보유. 석탄 가격 상승 시 발전 원가 증가. 다만 규제 요금제로 일부 전가 가능.", benefit_type: "피해", confidence: "보통" },
  ];

  for (const co of companies) {
    await sql`
      INSERT INTO stage3_companies (idea_id, company_name, ticker, exchange, sector, reason, benefit_type, confidence)
      VALUES (${ideaId}, ${co.name}, ${co.ticker}, ${co.exchange}, ${co.sector}, ${co.reason}, ${co.benefit_type}, ${co.confidence})
    `;
  }
  console.log(`✅ stage3 inserted: ${companies.length}개`);

  // ── 5. 키워드 추출 및 연결 ──
  const kwList = [
    { name: "석탄", category: "섹터" },
    { name: "뉴캐슬 석탄 선물", category: "테마" },
    { name: "LNG", category: "섹터" },
    { name: "에너지 가격", category: "테마" },
    { name: "계절적 수요", category: "테마" },
    { name: "벌크 해운", category: "섹터" },
    { name: "화력발전", category: "섹터" },
    { name: "호르무즈 해협", category: "테마" },
    { name: "우크라이나 전쟁", category: "테마" },
    { name: "호주", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "아프리카", category: "지역" },
    { name: "한국", category: "지역" },
    { name: "전력", category: "섹터" },
    { name: "난방", category: "테마" },
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

  // ── 6. 키워드 공동출현 관계 ──
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

insertCoalLng().catch(console.error);
