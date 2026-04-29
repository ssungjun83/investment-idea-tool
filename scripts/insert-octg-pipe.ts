import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertOctgPipe() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):
강관은 간단합니다.

고유가 -> 오래된다 -> 미국 친구들이 석유를 파낸다 -> 강관이 필요
(가스에도 들어감) -> 한국은 미국 강관 수출 2위 국가

시추기 숫자가 가장 낮을때 사서 피크 찍을때 파는 전략`;

  const title = "강관(OCTG) 사이클 — 미국 시추기 저점 매수 전략, 한국 강관사 수출 2위 수혜";

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
      ${"미국 시추 활동 사이클 회복기 진입 → 한국 강관(OCTG) 수출 사이클 매수 전략"},
      ${"강관(OCTG, Oil Country Tubular Goods)은 유정·가스정의 케이싱·튜빙·드릴파이프로 사용되는 시추 필수 자재이다. 고유가가 일정 기간 지속되면 기존 유전이 노화되고 미국(특히 셰일) E&P 업체들의 신규 시추 수요가 늘어나면서 OCTG·라인파이프 수요가 폭발한다. 한국은 미국 OCTG 수입국 2위로 세아제강·휴스틸·넥스틸·현대제철 등이 주요 공급자다. Baker Hughes 시추기 수(US Rig Count)는 강관 수요의 선행지표 역할을 하며, 시추기 수가 사이클 저점일 때 매수해 피크에서 차익실현하는 역행(contrarian) 사이클 전략이 유효하다."},
      ${"1) 고유가 지속 → 2) 기존 유전 노후화·생산성 저하 → 3) 미국 E&P 업체 자본지출(CAPEX) 확대 → 4) Baker Hughes 시추기 수 저점 통과 → 5) 셰일 시추 활동 재개 → 6) OCTG(케이싱·튜빙) + 라인파이프(API 5L) 수요 동시 폭발 → 7) 한국 강관사(세아제강·휴스틸·넥스틸 등) 수출 단가·물량 동반 상승 → 8) 가스 미드스트림 파이프라인 신규 건설로 라인파이프 수요까지 동반 → 9) 한국 열연(포스코·현대제철) 후방 수혜"},
      ${"단기(1-3개월): 시추기 수 저점 신호 확인 시점. 한국 강관사 1분기 수주잔고·수출 단가 모니터링 핵심. 중기(3-6개월): 시추기 수 본격 회복 + 강관 단가 인상 사이클 진입. 분기 실적 큰 폭 개선 가능. 장기(6-12개월): 시추기 수 피크 근접 시 차익실현 구간. 사이클 후반 진입 신호로 보유 비중 축소 검토. 주의: 셰일 효율 향상으로 과거 사이클 대비 시추기 수 절대치는 낮을 수 있음 — 단가·물량 모두 봐야 함."},
      ${JSON.stringify([
        "미국 반덤핑(AD)·상계관세(CVD) 재심에서 한국 강관사 관세율 상향 가능성",
        "유가 급락 시 미국 E&P CAPEX 축소로 시추 활동 위축",
        "셰일 시추 효율 향상(롱 래터럴, 동시 프랙)으로 시추기 수 증가 없이도 생산 가능",
        "미국 자국 내 강관 생산능력 확대 (US Steel, Tenaris의 미국 현지화 투자)",
        "일본·인도·중남미 강관사와의 수출 경쟁 심화",
        "미·중 무역 분쟁이 한국 철강에 부수적 관세로 확대될 가능성",
        "시추기 수 사이클 피크 시점 식별 실패 시 차익실현 타이밍 놓침"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "한국 강관(OCTG) 수출 단가·물량 동반 상승. 세아제강·휴스틸·넥스틸 등 미국향 매출 비중이 높은 기업의 매출·영업이익 큰 폭 개선. 사이클 회복기에는 분기별 실적 서프라이즈 가능.", magnitude: "상" },
    { order: 2, category: "산업", description: "미국 셰일 E&P 업체 시추 활동 확대. 신규 유정·가스정 굴착 증가로 OCTG 외에 머드모터·시멘팅·완결(Completion) 서비스 수요 동반 증가.", magnitude: "상" },
    { order: 3, category: "산업", description: "미국 육상 시추 장비 업체 가동률·일일 단가 상승. Patterson-UTI·Helmerich & Payne·Nabors 등 시추 컨트랙터 수익성 회복.", magnitude: "상" },
    { order: 4, category: "산업", description: "가스 미드스트림 파이프라인 신규 건설 증가 — 라인파이프(API 5L) 수요 확대. Williams·TC Energy·Energy Transfer 등 인프라 투자 확대.", magnitude: "중" },
    { order: 5, category: "산업", description: "한국 열연강판(HR) 수요 증가. 강관 원재료인 열연 공급사인 포스코홀딩스·현대제철 후방 간접 수혜. 열연 가격 강세 사이클 동반.", magnitude: "중" },
    { order: 6, category: "금융", description: "한국 강관 기업 밸류에이션 재평가. 그동안 디스카운트되던 종목들이 사이클 회복기에 P/B·P/E 동시 확장 구간 진입 가능.", magnitude: "중" },
    { order: 7, category: "산업", description: "프랙 샌드(Frac sand)·압력 펌핑 등 완결(Completion) 단계 자재·서비스 수요 동반 증가. ProPetro·Liberty Energy 등 수혜.", magnitude: "중" },
    { order: 8, category: "정책", description: "미국 반덤핑·상계관세(AD/CVD) 연례재심이 사이클의 핵심 변수. 관세율 동결·인하 시 한국 기업 추가 모멘텀, 인상 시 단기 충격 가능.", magnitude: "중" },
    { order: 9, category: "산업", description: "강관 슬리팅·코팅 등 후방 가공 업체 가동률 상승. 한국 내 중소 강관 가공사 수혜.", magnitude: "하" },
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
    // ── 한국 강관 (직접수혜 — 핵심) ──
    { name: "세아제강", ticker: "306200.KS", exchange: "KRX", sector: "강관", reason: "한국 OCTG 수출 대장주. 미국향 OCTG·라인파이프 매출 비중이 높아 미국 시추 활동 회복 시 직접적 수혜. 휴스턴 가공기지 등 현지 인프라도 강점. 사이클 회복기에 매출·이익 더블 레버리지.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "세아제강지주", ticker: "003030.KS", exchange: "KRX", sector: "지주", reason: "세아제강 지주회사. 자회사 실적 호조 시 지분법 이익 + 배당 수익 동반 개선. 강관 사이클 노출의 또 다른 통로.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "휴스틸", ticker: "005010.KS", exchange: "KRX", sector: "강관", reason: "OCTG·라인파이프 전문 중견사. 미국 수출 비중이 높아 시추기 수 회복 시 분기 실적 큰 폭 개선. 사이클 종목 특성상 주가 탄력 큼.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "넥스틸", ticker: "092790.KS", exchange: "KRX", sector: "강관", reason: "OCTG 특화 강관사. 미국 시장이 사실상 단일 핵심 시장이라 시추 사이클과 가장 높은 연동성. 사이클 베타 가장 높은 종목 중 하나.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "현대제철", ticker: "004020.KS", exchange: "KRX", sector: "철강", reason: "강관 사업부 보유 + 열연 공급자. 강관 직접 수출과 동시에 다른 강관사들에 열연을 공급하는 이중 노출. 다만 사업 비중이 분산되어 베타는 상대적으로 낮음.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "동양철관", ticker: "008970.KS", exchange: "KRX", sector: "강관", reason: "라인파이프(API 5L) 중심의 중소 강관사. 가스 파이프라인 신규 건설 사이클에 노출. 시추기 회복보다 미드스트림 CAPEX와 더 연동.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 열연 (간접수혜 — 후방) ──
    { name: "POSCO홀딩스", ticker: "005490.KS", exchange: "KRX", sector: "철강", reason: "강관 원재료인 열연강판(HR) 공급. 강관 수요 회복 시 열연 가격 강세 사이클 동반. 다만 사업 다각화로 강관 사이클만의 영향은 제한적.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 미국 육상 시추 (간접수혜 — 시추기 수 회복) ──
    { name: "Patterson-UTI Energy", ticker: "PTEN", exchange: "NASDAQ", sector: "시추 서비스", reason: "미국 육상 시추 컨트랙터 1위급. 시추기 수 회복 시 가동률·일일 단가 동반 상승. 강관 사이클의 미국측 거울 종목으로 동행성 높음.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "Helmerich & Payne", ticker: "HP", exchange: "NYSE", sector: "시추 서비스", reason: "미국 셰일 시추 1위급 컨트랙터. 첨단 시추 장비(Super-Spec rig) 보유로 단가 프리미엄. 시추 활동 회복 시 가장 직접적 수혜.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "Nabors Industries", ticker: "NBR", exchange: "NYSE", sector: "시추 서비스", reason: "글로벌 육상 시추 서비스. 미국 + 중동 노출. 시추기 수 회복 사이클의 고베타 종목.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "ProPetro Holding", ticker: "PUMP", exchange: "NYSE", sector: "유전 완결 서비스", reason: "퍼미안 분지 압력 펌핑(프랙) 전문. 시추 후 완결(Completion) 단계 자재·서비스 수요 증가의 직접 수혜.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 미국 E&P (수요 견인) ──
    { name: "EOG Resources", ticker: "EOG", exchange: "NYSE", sector: "셰일 E&P", reason: "미국 최대 셰일 E&P 중 하나. 시추 활동 확대의 시발점이자 강관 수요의 원천. 강관 사이클의 선행 트리거로 모니터링 가치 높음.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "Diamondback Energy", ticker: "FANG", exchange: "NASDAQ", sector: "셰일 E&P", reason: "퍼미안 분지 셰일 E&P. 시추 효율과 자본 규율로 사이클 회복기에 CAPEX 확대 가능. OCTG 수요의 핵심 고객 중 하나.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 미드스트림 (라인파이프 수요) ──
    { name: "Williams Companies", ticker: "WMB", exchange: "NYSE", sector: "미드스트림", reason: "미국 최대 천연가스 미드스트림. 신규 가스 파이프라인 건설 시 라인파이프(API 5L) 수요 견인. 한국 강관사 라인파이프 부문 수혜와 동행.", benefit_type: "간접수혜", confidence: "보통" },
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
    { name: "강관", category: "테마" },
    { name: "OCTG", category: "테마" },
    { name: "라인파이프", category: "테마" },
    { name: "시추기 수", category: "테마" },
    { name: "Baker Hughes Rig Count", category: "테마" },
    { name: "셰일", category: "테마" },
    { name: "셰일가스", category: "테마" },
    { name: "고유가", category: "테마" },
    { name: "사이클 투자", category: "테마" },
    { name: "역행 투자", category: "테마" },
    { name: "철강", category: "섹터" },
    { name: "열연강판", category: "테마" },
    { name: "시추 서비스", category: "섹터" },
    { name: "셰일 E&P", category: "섹터" },
    { name: "미드스트림", category: "섹터" },
    { name: "파이프라인", category: "테마" },
    { name: "프랙", category: "테마" },
    { name: "반덤핑", category: "테마" },
    { name: "무역 관세", category: "테마" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
    { name: "퍼미안", category: "지역" },
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

insertOctgPipe().catch(console.error);
