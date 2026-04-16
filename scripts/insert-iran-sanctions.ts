import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertIranSanctions() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `송도리의 뉴스클리핑 2026년 2분기 (4/13):
미국, 이란산 원유 밀수 제재 면제 조치 만료 해제. 트럼프 대통령은 이란산 원유 밀수에 대한 30일간의 제재 면제 조치를 4월 19일로 만료시키기로 결정. 이로써 이란 원유 수출은 사실상 차단될 전망이며, 원유가 세계 시장 공급을 줄여 유가 상승 압력 예상.

동남아시아 / 인도 / 중국에서 주유소 대란이지 LPG 대란이 돌면서, 미국이나 한국에서도 발생하게 되면 그제서야 시장이 심각성을 알게 될 것.

일반 투자자들은 '평화 협정이 체결되거나 유조선 운항이 재개될' 것이라고 생각하지만 실제 수혜는 인프라 관련주.

넥스틸 / 휴스틸 / 삼성 E&A 정도가 가장 나아보임.
피팅: 성광벤드 / 태광 / 하이록코리아.
참고로 석유 가격에 베팅은 절대 안함. 석유시장은 조작의 일상이라서.`;

  const title = "이란 제재 면제 만료 → 원유 공급 차단 → 강관·피팅·EPC 인프라 수혜";

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
      ${"이란 제재 면제 만료에 따른 글로벌 원유 공급 축소 — 강관·피팅·EPC 인프라 수혜주 집중"},
      ${"트럼프 대통령이 이란산 원유 밀수에 대한 30일간의 제재 면제 조치를 2026년 4월 19일자로 만료시키기로 결정했다. 이란 원유 수출이 사실상 차단되면서 글로벌 원유 공급이 줄어들 전망이다. 이미 동남아·인도·중국에서 주유소 대란과 LPG 부족 사태가 발생하고 있으며, 이 현상이 미국·한국까지 확산될 가능성이 있다. 유가 직접 베팅은 선물시장 조작 리스크로 비효율적이며, 대신 에너지 인프라(강관·피팅·EPC) 관련 기업이 구조적 수혜를 받을 것으로 판단."},
      ${"1) 이란 제재 면제 만료(4/19) → 이란산 원유 수출 차단 → 2) 글로벌 원유 공급 축소 → 유가 상승 압력 → 3) 대체 공급원(미국 셰일·남미·서아프리카) 개발 가속화 → 4) 에너지 인프라 투자 확대 → 강관(OCTG)·피팅·밸브 수요 급증 → 5) EPC 플랜트 수주 확대 → 6) 동남아·인도·중국 LPG·주유소 대란 → 한국 수출 기회 확대"},
      ${"단기(1-3개월): 4/19 제재 만료 확정 후 에너지 인프라주 모멘텀. 동남아·인도 LPG 대란 심화 시 시장 인식 전환. 중기(3-6개월): 미국 셰일·deepwater 개발 투자 확대로 강관·피팅 수주 본격화. EPC 기업 수주 파이프라인 확대. 장기(6-12개월): 글로벌 에너지 공급망 재편 구조화. 한국 강관·피팅 기업의 수출 비중 확대."},
      ${JSON.stringify([
        "이란과 미국 간 협상 타결로 제재 해제 가능성",
        "OPEC+ 증산으로 이란 물량 대체 시 인프라 투자 축소",
        "유가 급등 시 글로벌 경기 침체 우려 → 에너지 수요 감소 역풍",
        "중국 경기 둔화 지속 시 아시아 에너지 수요 약화",
        "유가 선물시장 조작 리스크 — 방향 베팅 비효율",
        "러시아 원유 우회 수출로 공급 부족 완화 가능성"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "에너지 인프라 투자 확대 — 이란 원유 차단으로 대체 공급원(미국 셰일·deepwater·남미·서아프리카) 개발 가속화. 시추·파이프라인·플랜트 건설 수요 급증. 강관(OCTG)·피팅·밸브 기업 직접 수혜.", magnitude: "상" },
    { order: 2, category: "산업", description: "동남아·인도·중국 LPG·주유소 대란 확산. 에너지 공급 부족이 소비국까지 파급되면서 에너지 안보 투자 긴급성 부각. 한국 강관·피팅 기업의 아시아 수출 기회 확대.", magnitude: "상" },
    { order: 3, category: "산업", description: "EPC 플랜트 수주 확대 — 대체 에너지 공급 인프라 건설(LNG 터미널·정유 설비·파이프라인) 발주 증가. 삼성E&A 등 한국 EPC 기업 수혜.", magnitude: "상" },
    { order: 4, category: "금융", description: "에너지 가격 상승 → 인플레이션 압력. 식품·운송비 상승으로 소비자물가 상방 압력. 금리 인상 기조 강화 가능성.", magnitude: "중" },
    { order: 5, category: "산업", description: "정유·운송 업종 양면 영향 — 정유사 마진 단기 개선 가능하나 원유 조달 불안정. 항공·물류 원가 상승 부담.", magnitude: "중" },
    { order: 6, category: "산업", description: "대체 에너지 전환 가속 — 화석연료 공급 불안정으로 LNG·신재생에너지 전환 투자 명분 강화.", magnitude: "하" },
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
    // 강관 (OCTG)
    { name: "넥스틸", ticker: "286940.KS", exchange: "KRX", sector: "강관 제조", reason: "한국 대표 OCTG(유정용) 강관 기업. 이란 원유 차단으로 대체 공급원 시추 활성화 시 케이싱·라이저 파이프 수요 급증. 미국 셰일 수출향 강관 수주 확대 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "휴스틸", ticker: "005010.KS", exchange: "KRX", sector: "강관 제조", reason: "스테인리스 강관·특수강관 전문. 에너지 인프라 확장에 따른 내부식성 강관 수요 증가. 플랜트·해양 프로젝트용 고급 강관 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "세아제강", ticker: "306200.KS", exchange: "KRX", sector: "강관 제조", reason: "에너지용 강관 주력. 미국 E&P 투자 확대로 강관 수출 물량 증가. 이란 공급 차단 시 대체 시추 수요의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Tenaris", ticker: "TS", exchange: "NYSE", sector: "OCTG 강관", reason: "세계 최대 OCTG 강관 제조사. 글로벌 시추 활성화로 케이싱·튜빙 수요 급증.", benefit_type: "직접수혜", confidence: "높음" },

    // 피팅·밸브
    { name: "성광벤드", ticker: "014620.KS", exchange: "KRX", sector: "파이프 피팅", reason: "파이프라인 피팅(엘보·티·리듀서) 전문. 에너지 인프라·플랜트 배관 설비 확대로 직접 수혜. 중동·미국 플랜트 수출 비중 높음.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "태광", ticker: "023160.KS", exchange: "KRX", sector: "파이프 피팅", reason: "스테인리스 피팅·플랜지 제조. 에너지·석유화학 플랜트 배관 자재로 수요 확대. 고부가 제품 비중 증가 추세.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "하이록코리아", ticker: "013030.KS", exchange: "KRX", sector: "밸브·피팅", reason: "초고압 피팅·밸브·튜브 전문. 반도체·에너지·조선 등 고부가 산업용 배관 부품. 에너지 인프라 확장 시 수혜.", benefit_type: "직접수혜", confidence: "높음" },

    // EPC
    { name: "삼성E&A", ticker: "028050.KS", exchange: "KRX", sector: "EPC·플랜트", reason: "중동·미국 EPC 플랜트 전문. 이란 원유 차단으로 대체 에너지 인프라(LNG 터미널·정유설비·파이프라인) 건설 수주 확대 기대. 해외 수주 파이프라인 견조.", benefit_type: "직접수혜", confidence: "높음" },

    // 글로벌 비교 기업
    { name: "Baker Hughes", ticker: "BKR", exchange: "NASDAQ", sector: "유전 서비스·장비", reason: "LNG 기자재·시추 장비 세계 1위급. 대체 공급원 개발 가속화로 전방위 수주 확대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "SLB (Schlumberger)", ticker: "SLB", exchange: "NYSE", sector: "유전 서비스", reason: "글로벌 최대 유전 서비스 기업. 이란 제재로 비중동 지역 시추 활동 확대 시 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
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
    { name: "이란 제재", category: "테마" },
    { name: "원유 공급", category: "테마" },
    { name: "OCTG 강관", category: "섹터" },
    { name: "강관", category: "섹터" },
    { name: "파이프 피팅", category: "섹터" },
    { name: "밸브", category: "섹터" },
    { name: "EPC 플랜트", category: "섹터" },
    { name: "LPG 대란", category: "테마" },
    { name: "에너지 인프라", category: "테마" },
    { name: "공급망 다변화", category: "테마" },
    { name: "미국 셰일", category: "테마" },
    { name: "트럼프", category: "테마" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
    { name: "동남아시아", category: "지역" },
    { name: "인도", category: "지역" },
    { name: "중국", category: "지역" },
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

insertIranSanctions().catch(console.error);
