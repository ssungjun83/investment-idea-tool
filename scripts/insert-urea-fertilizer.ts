import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertUreaFertilizer() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `[YTN] 이란 전쟁에 요소 가격 폭등…"비료 생산 어려워"

이란 전쟁 여파로 비료의 주원료인 요소 가격이 급등하고 있습니다.
전쟁 이후 요소 국제 가격이 두 배 이상 오르면서 비료 생산에도 차질을 빚고 있습니다.
현장에 취재기...

(맥락) 요소(urea)는 천연가스를 원료로 암모니아 → 요소로 합성되는 질소비료의 핵심 원료이자,
디젤 차량 SCR 시스템용 요소수(DEF/AdBlue)의 주성분.
이란·중동·중국이 글로벌 요소·암모니아 주요 생산지.
호르무즈 사태 + 천연가스 공급 차질로 글로벌 요소 시장 타이트.
한국은 요소 수입 의존도 매우 높음 → 2021년 요소수 사태 재현 우려.`;

  const title = "이란 전쟁발 요소 가격 2배 폭등 — 글로벌 비료 메이저 수혜 + 한국 요소수 공급망 충격";

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
      ${"이란 전쟁발 요소·암모니아 가격 2배 급등 → 글로벌 질소비료 사이클 + 한국 요소수 공급망 충격 (2021년 요소수 사태 재현 우려)"},
      ${"YTN 보도에 따르면 이란 전쟁 여파로 비료 주원료인 요소 국제가격이 두 배 이상 급등하며 비료 생산에 차질이 발생 중이다. 요소는 천연가스를 원료로 암모니아 → 요소로 합성되는 질소비료의 핵심 원료이자, 디젤 차량 SCR 시스템용 요소수(DEF/AdBlue)의 주성분이다. 이란·중동·중국·러시아가 글로벌 요소·암모니아 주요 생산지로, 호르무즈 사태와 중동 천연가스 공급망 타이트가 동시에 진행되면서 요소 시장이 구조적 타이트 국면으로 진입했다. 한국은 요소 수입 의존도가 매우 높아 2021년 요소수 대란이 재현될 가능성이 있고, 글로벌로는 북미 가스 기반 비료 생산자(CF Industries·Nutrien)가 가격 결정력을 회복하는 직접 수혜 국면이다."},
      ${"1) 이란 전쟁·호르무즈 봉쇄 → 2) 중동 천연가스 공급망 타이트 → 3) 암모니아·요소 국제가격 2배 급등 → 4) 글로벌 비료 생산 차질 (특히 가스 부족 지역) → 5) 살아남은 비료 생산자(북미 가스 기반)의 가격 결정력·마진 확대 → 6) 한국 요소수 공급망 충격 → 디젤 트럭 운행 차질 우려 → 7) 한국 요소수 메이저(롯데정밀화학) 가격 인상 + 단기 마진 개선 → 8) 비료 가격 급등 → 농가 부담 증가 + 농산물 가격 인플레이션 → 9) 글로벌 식량 인플레이션 압력 → 10) 농업 장비·곡물 메이저까지 가격 사이클 동반"},
      ${"단기(1-3개월): 요소·암모니아 현물가격 추가 강세. 북미 비료 메이저 분기 실적 서프라이즈. 한국 요소수 사재기·재고 부족 조짐 모니터링 핵심. 중기(3-6개월): 비료 가격 강세 사이클 본격화. 농산물 가격 인플레이션 시작. 한국 정부 요소 비축·수입 다변화 정책 발표 가능. 농가 보조금 논의. 장기(6-12개월): 사태 종료 시 요소 가격 일부 정상화 가능. 그러나 공급망 재편(중동·중국 → 북미·중앙아시아) 구조적 변화 지속. 비료 메이저는 회복 사이클 동반 멀티플 리레이팅."},
      ${JSON.stringify([
        "이란 사태 조기 종결로 요소 국제가격 빠른 정상화",
        "중국 요소 수출 재개·쿼터 완화 시 가격 하락 압박",
        "천연가스(헨리허브·유럽 TTF) 가격 급등 시 비료 생산자 원가 부담 가중",
        "글로벌 경기 침체로 농산물 수요 둔화 → 비료 수요 감소",
        "한국 정부의 요소 가격 통제·비축 매도 정책으로 단기 가격 충격 흡수",
        "2021년 사태 학습 효과로 한국 기업·정부 사전 비축 충분할 가능성",
        "농가 부담 가중에 따른 정부 비료 보조금 확대로 비료 메이저 가격 결정력 약화"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "글로벌 요소·암모니아·복합비료 가격 급등. CF Industries·Nutrien·Mosaic 등 북미 비료 메이저 매출·마진 동반 확대. 가스 기반 저원가 생산 구조로 사이클 회복기에 가장 큰 수혜.", magnitude: "상" },
    { order: 2, category: "산업", description: "한국 요소수(DEF) 공급망 충격. 롯데정밀화학(유록스) 가격 인상 + 단기 마진 개선. 2021년 요소수 사태 재현 우려로 사재기·재고 부족 조짐 가능.", magnitude: "상" },
    { order: 3, category: "산업", description: "디젤 트럭·물류·중장비 산업 단기 부담. 화물·택배·건설장비 운영비 상승. 일부 운행 차질 시 물류대란 우려.", magnitude: "중" },
    { order: 4, category: "산업", description: "한국 비료·농화학 업체(남해화학·동방아그로·효성오앤비) 가격 인상 사이클 진입. 다만 농가 부담·정부 보조금 정책에 따라 가격 결정력 제한 가능.", magnitude: "중" },
    { order: 5, category: "산업", description: "농가 부담 증가 + 농산물 가격 인플레이션. 곡물·과채류 가격 강세 → 식품 인플레이션 압력. 곡물 메이저(Bunge·ADM) 거래 마진 확대.", magnitude: "중" },
    { order: 6, category: "산업", description: "미국 셰일가스 E&P 업체 간접 수혜. 암모니아·요소 원료인 천연가스 수요 증가. EQT·Range Resources·EOG 등 가스 비중 높은 E&P 추가 모멘텀.", magnitude: "중" },
    { order: 7, category: "정책", description: "한국 정부 요소 비축 확대·수입 다변화 정책. 산업통상자원부 긴급 대응. 정부 발 정책 발표가 단기 주가·가격 변수.", magnitude: "중" },
    { order: 8, category: "산업", description: "디젤→가솔린·전기 트럭 전환 가속화 가능성. 요소수 의존도 회피 차원의 친환경 상용차 수요 증가. 현대차·테슬라 세미·니콜라 등 모멘텀.", magnitude: "하" },
    { order: 9, category: "산업", description: "농업 장비·정밀농업 기업 양면성. Deere 등은 비료 가격 급등으로 농가 CAPEX 일시 위축, 그러나 정밀농업(비료 효율 극대화) 솔루션 수요 증가의 중장기 모멘텀.", magnitude: "하" },
    { order: 10, category: "금융", description: "비료 ETF·농업 관련 자금 유입. 식량·비료 테마 ETF(MOO 등) 거래 확대. 인플레이션 헤지 자산 부각.", magnitude: "하" },
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
    // ── 글로벌 비료 메이저 (직접수혜) ──
    { name: "CF Industries", ticker: "CF", exchange: "NYSE", sector: "비료", reason: "북미 최대 질소비료(요소·암모니아) 생산자. 미국 셰일가스 기반 저원가 구조로 글로벌 요소가격 급등 시 압도적 마진 레버리지. 사이클 회복기의 핵심 직접 수혜 종목.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Nutrien", ticker: "NTR", exchange: "NYSE", sector: "비료", reason: "세계 최대 종합 비료 기업 (질소·인광·칼리 통합). 글로벌 비료 가격 강세 사이클에서 매출·EBITDA 동반 확대. 안정적 수익원과 사이클 노출의 균형.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Mosaic", ticker: "MOS", exchange: "NYSE", sector: "비료", reason: "인광·칼리비료 글로벌 메이저. 요소·암모니아 직접 노출은 적으나 비료 가격 사이클 동반 상승 + 농가의 복합비료 수요 증가 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "LSB Industries", ticker: "LXU", exchange: "NYSE", sector: "암모니아", reason: "미국 암모니아·요소·질산 전문 중견사. 가스 기반 저원가 생산. 사이클 베타가 가장 큰 소형 직접 수혜 종목.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 요소수·질소화학 (직접수혜) ──
    { name: "롯데정밀화학", ticker: "004000.KS", exchange: "KRX", sector: "정밀화학", reason: "한국 요소수(유록스) 메이저. 요소 가격 급등 + 디젤 차량 요소수 수요 증가의 동시 수혜. 2021년 요소수 사태 시 가격 인상으로 큰 폭 실적 개선 전례. 단기 모멘텀 가장 강한 한국 종목.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "휴켐스", ticker: "069260.KS", exchange: "KRX", sector: "정밀화학", reason: "질산·DNT·암모니아 등 질소 화학 통합 기업. 암모니아 가격 급등 시 원가 부담 vs 가격 전가의 양면성, 그러나 통합 사업 구조로 가격 강세 사이클의 순효과는 긍정적.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 비료 (직접수혜) ──
    { name: "남해화학", ticker: "025860.KS", exchange: "KRX", sector: "비료", reason: "한국 최대 비료 생산업체. 요소·복합비료 가격 인상 사이클 진입의 직접 수혜. 다만 농가 부담·정부 보조금 정책 변수 존재.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "효성오앤비", ticker: "097870.KQ", exchange: "KOSDAQ", sector: "농약·비료", reason: "농약·비료 중견 업체. 비료 가격 강세 사이클의 간접 수혜 + 농가 비용 전가 가능 시 마진 개선.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 미국 셰일가스 E&P (간접수혜 — 요소 원료) ──
    { name: "EQT Corporation", ticker: "EQT", exchange: "NYSE", sector: "셰일가스 E&P", reason: "미국 최대 천연가스 생산자. 비료(요소·암모니아) 원료인 가스 수요 증가 → 헨리허브 가격 강세의 직접 수혜. LNG·비료 양 사이클 동시 노출.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "EOG Resources", ticker: "EOG", exchange: "NYSE", sector: "셰일 E&P", reason: "셰일 가스·NGL 생산자. 비료용 가스 수요 증가의 간접 수혜. E&P 사이클 회복과 동행.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 곡물·식량 (간접수혜 — 농산물 인플레이션) ──
    { name: "Bunge Global", ticker: "BG", exchange: "NYSE", sector: "곡물 트레이딩", reason: "글로벌 곡물·식용유 메이저. 비료 가격 급등 → 농산물 가격 강세 → 거래·가공 마진 확대. 식량 인플레이션 헤지 종목.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "Archer-Daniels-Midland", ticker: "ADM", exchange: "NYSE", sector: "곡물 트레이딩", reason: "글로벌 곡물 가공·트레이딩 메이저. 농산물 가격 사이클 회복 시 마진 확대. 단, 영농 비용 상승은 일부 양면성.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 농업 장비 (양면) ──
    { name: "Deere & Company", ticker: "DE", exchange: "NYSE", sector: "농업 장비", reason: "글로벌 농기계 1위. 단기적으로 비료 가격 급등으로 농가 CAPEX 위축 우려, 중장기적으로는 정밀농업(비료 효율화) 솔루션 수요 증가. 양면성 있지만 사이클 후반 회복 종목.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 한국 물류 (단기 피해 — 디젤·요소수 의존) ──
    { name: "CJ대한통운", ticker: "000120.KS", exchange: "KRX", sector: "물류", reason: "디젤 트럭 의존도 높은 한국 최대 물류사. 요소수 공급망 충격 시 운영비 상승 + 일부 운행 차질 우려. 단기 피해주이나 장기적으론 가격 전가로 회복.", benefit_type: "피해", confidence: "보통" },
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
    { name: "요소", category: "테마" },
    { name: "암모니아", category: "테마" },
    { name: "질소비료", category: "테마" },
    { name: "비료", category: "섹터" },
    { name: "요소수", category: "테마" },
    { name: "DEF", category: "테마" },
    { name: "유록스", category: "테마" },
    { name: "이란 전쟁", category: "테마" },
    { name: "호르무즈", category: "테마" },
    { name: "호르무즈 봉쇄", category: "테마" },
    { name: "천연가스", category: "테마" },
    { name: "헨리허브", category: "테마" },
    { name: "셰일가스", category: "테마" },
    { name: "셰일가스 E&P", category: "섹터" },
    { name: "디젤", category: "테마" },
    { name: "물류", category: "섹터" },
    { name: "농업", category: "섹터" },
    { name: "곡물 트레이딩", category: "섹터" },
    { name: "식량 인플레이션", category: "테마" },
    { name: "농산물 가격", category: "테마" },
    { name: "정밀화학", category: "섹터" },
    { name: "농약", category: "테마" },
    { name: "농기계", category: "테마" },
    { name: "2021 요소수 사태", category: "테마" },
    { name: "공급망 다변화", category: "테마" },
    { name: "한국", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "이란", category: "지역" },
    { name: "중동", category: "지역" },
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

insertUreaFertilizer().catch(console.error);
