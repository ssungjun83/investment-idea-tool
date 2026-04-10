import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertIdea() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `Phillips 66 faces $900 million loss as low crude oil prices crash refining margins. U.S. refiner Phillips 66 said on Monday its first-quarter results include nearly $900 million in pre-tax mark-to-market losses. 유가 하락으로 정제마진 급락, 미국 정유사 실적 악화.`;

  const title = "유가 하락 → 정제마진 붕괴";

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
      ${"유가 하락에 따른 정유·정제 산업 구조 변화 및 수혜/피해 기업 분석"},
      ${"2025년 1분기 원유 가격 급락으로 Phillips 66 등 주요 정유사의 정제 마진이 급격히 악화되었다. 크랙 스프레드(원유-석유제품 가격차)가 축소되면서 정유사의 수익성이 크게 훼손되고, mark-to-market 손실이 $900M에 달하는 상황이다."},
      ${"1) 원유 공급 과잉·수요 둔화로 유가 하락 → 2) 정유사 재고 평가손실 및 크랙 스프레드 축소 → 3) 정유 섹터 실적 악화 → 4) 반면 저유가는 항공·운송·석유화학 등 원가 절감 효과 → 5) 에너지 섹터 내 투자 축소 → 6) 신재생에너지 전환 압력 증가"},
      ${"단기(1-3개월): 정유사 실적 부진 지속, 주가 하락 압력. 중기(3-6개월): 유가 반등 시 재고 이익 전환 가능, 저유가 수혜 섹터 실적 개선. 장기(6-12개월): OPEC+ 감산 여부에 따라 유가 방향 결정, 에너지 전환 가속화 가능성."},
      ${JSON.stringify(["OPEC+ 감산으로 유가 급반등 가능성", "지정학적 리스크(중동 긴장)로 유가 급등", "글로벌 경기 침체 심화 시 수요 추가 감소", "정유사 대규모 감산·가동률 축소 리스크"])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "정유·정제 산업 전반의 마진 압축. Phillips 66, Valero, Marathon Petroleum 등 미국 독립 정유사 실적 악화. 크랙 스프레드 축소로 가동률 조정 압력.", magnitude: "상" },
    { order: 2, category: "산업", description: "항공·해운·운송 산업의 연료비 절감 효과. 저유가는 항공사와 물류기업에 직접적인 원가 절감으로 이어져 영업이익 개선.", magnitude: "상" },
    { order: 3, category: "산업", description: "석유화학(나프타 기반) 업체 원료비 하락. 에틸렌·프로필렌 등 기초 화학제품 마진 개선 가능.", magnitude: "중" },
    { order: 4, category: "금융", description: "에너지 섹터 하이일드 채권 스프레드 확대. 중소 정유·E&P 업체 신용 리스크 증가로 에너지 관련 회사채 시장 불안.", magnitude: "중" },
    { order: 5, category: "기술", description: "신재생에너지 전환 압력 증가. 화석연료 기업 수익성 악화가 ESG·에너지 전환 투자 가속화의 촉매 역할.", magnitude: "중" },
    { order: 6, category: "소비자", description: "휘발유·경유 소매가 하락으로 소비자 가처분소득 증가. 내수 소비 회복에 간접 기여.", magnitude: "하" },
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
    { name: "Phillips 66", ticker: "PSX", exchange: "NYSE", sector: "정유", reason: "유가 하락으로 $900M mark-to-market 손실 발생. 정제마진 악화로 단기 실적 부진 불가피. 다만 미드스트림·화학 부문이 하방 지지.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Valero Energy", ticker: "VLO", exchange: "NYSE", sector: "정유", reason: "미국 최대 독립 정유사로 크랙 스프레드 축소에 직접 노출. 정제 전문 기업 특성상 유가 하락 영향이 가장 큼.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Delta Air Lines", ticker: "DAL", exchange: "NYSE", sector: "항공", reason: "연료비가 영업비용의 20~25% 차지. 유가 하락 시 연간 수십억 달러 원가 절감 효과. 2025년 실적 가이던스 상향 가능.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "대한항공", ticker: "003490.KS", exchange: "KRX", sector: "항공", reason: "국제유가 하락은 항공유 가격 하락으로 직결. 아시아나 합병 후 규모의 경제 효과와 맞물려 수익성 대폭 개선 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "LG화학", ticker: "051910.KS", exchange: "KRX", sector: "석유화학", reason: "나프타 기반 석유화학 업체로 원료비 하락 시 스프레드 개선. 배터리 소재 사업과 함께 화학 부문 턴어라운드 가능.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "Marathon Petroleum", ticker: "MPC", exchange: "NYSE", sector: "정유", reason: "미국 최대 정유 능력 보유. 크랙 스프레드 하락에 직접 영향. 다만 미드스트림 자회사 MPLX가 안정적 캐시플로우 제공.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "HMM", ticker: "011200.KS", exchange: "KRX", sector: "해운", reason: "벙커유 가격 하락으로 운항 원가 절감. 컨테이너·벌크 운임이 유지되는 한 이익률 개선.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "NextEra Energy", ticker: "NEE", exchange: "NYSE", sector: "신재생에너지", reason: "화석연료 수익성 악화가 신재생에너지 전환 논리를 강화. 풍력·태양광 발전 투자 가속화의 간접 수혜.", benefit_type: "간접수혜", confidence: "보통" },
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
    { name: "유가 하락", category: "테마" },
    { name: "정제마진", category: "섹터" },
    { name: "크랙 스프레드", category: "기술" },
    { name: "정유", category: "섹터" },
    { name: "Phillips 66", category: "회사" },
    { name: "항공", category: "섹터" },
    { name: "석유화학", category: "섹터" },
    { name: "신재생에너지", category: "테마" },
    { name: "에너지 전환", category: "테마" },
    { name: "OPEC+", category: "테마" },
    { name: "원유", category: "섹터" },
    { name: "해운", category: "섹터" },
    { name: "연료비", category: "테마" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
  ];

  const savedKwIds: number[] = [];

  for (const kw of kwList) {
    // upsert keyword
    const existing = await sql`SELECT id FROM keywords WHERE LOWER(name) = LOWER(${kw.name}) LIMIT 1`;
    let kwId: number;
    if (existing.length > 0) {
      kwId = existing[0].id as number;
    } else {
      const [inserted] = await sql`INSERT INTO keywords (name, category) VALUES (${kw.name}, ${kw.category}) RETURNING id`;
      kwId = inserted.id as number;
    }
    savedKwIds.push(kwId);

    // link idea ↔ keyword
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

insertIdea().catch(console.error);
