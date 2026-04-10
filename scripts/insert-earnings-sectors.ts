import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertEarningsSectors() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `FundEasy Earnings Calls 분석:
- 에너지 섹터(XOM, CVX, COP, VLO, MPC, EOG): EPS 컨센서스 대폭 상향 조정. 유가 상승 및 정제 마진 개선 기대감 반영.
- 반도체 섹터(MU, AMAT, ADI): 긍정적 EPS 수정. AI 및 데이터센터 투자 확대 수혜 전망. 칩스법 관련 수혜 기대.
- 헬스케어 섹터(BSX, ABBV, ABT, MRK, MDT): 옵션 시장 약세 시그널 및 EPS 하향 조정 혼재. 전반적인 헬스케어 섹터에 대한 신중한 접근 필요.`;

  const title = "어닝 시즌 섹터별 EPS 컨센서스 변동 — 에너지·반도체 상향, 헬스케어 하향";

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
      ${"2025 어닝 시즌 섹터별 EPS 컨센서스 변동 분석 및 투자 전략"},
      ${"2025년 어닝 시즌을 앞두고 섹터별 EPS 컨센서스에 뚜렷한 차별화가 나타나고 있다. 에너지 섹터는 유가 상승과 정제마진 개선으로 EPS가 대폭 상향 조정되었고, 반도체 섹터는 AI·데이터센터 투자 확대와 칩스법(CHIPS Act) 수혜로 긍정적 수정이 이뤄졌다. 반면 헬스케어 섹터는 옵션 시장에서 약세 시그널이 포착되고 EPS 하향 조정이 혼재하여 신중한 접근이 필요한 상황이다."},
      ${"1) 유가 상승 및 정제마진 개선 → 에너지 섹터 EPS 대폭 상향 → 정유·에너지 기업 실적 서프라이즈 기대 → 2) AI·데이터센터 CAPEX 확대 → 반도체 장비·메모리 수요 증가 → 반도체 섹터 EPS 긍정적 수정 → 칩스법 보조금 효과 반영 → 3) 헬스케어 옵션 시장 약세 시그널 → EPS 하향 조정 혼재 → 의료기기·제약 섹터 실적 불확실성 확대"},
      ${"단기(1-3개월): 어닝 시즌 실적 발표에 따른 섹터 로테이션. 에너지·반도체 아웃퍼폼, 헬스케어 언더퍼폼 예상. 중기(3-6개월): 유가 방향성과 AI 투자 지속 여부가 트렌드 결정. 장기(6-12개월): 칩스법 보조금 집행 효과 본격화, 에너지 전환 정책 변화에 따른 섹터 재편."},
      ${JSON.stringify([
        "유가 급락 시 에너지 섹터 EPS 하향 조정 가능",
        "AI 투자 둔화 또는 과열 논란 시 반도체 밸류에이션 조정",
        "헬스케어 규제 완화 또는 신약 승인으로 반등 가능",
        "거시경제 침체 시 전 섹터 EPS 하향 압력",
        "지정학적 리스크로 인한 공급망 차질"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "에너지 섹터 전반의 EPS 컨센서스 대폭 상향. 유가 상승과 정제마진 개선이 XOM, CVX, COP, VLO, MPC, EOG 등 주요 에너지 기업의 실적 기대치를 끌어올림.", magnitude: "상" },
    { order: 2, category: "기술", description: "반도체 섹터 EPS 긍정적 수정. AI·데이터센터 투자 확대로 MU(메모리), AMAT(장비), ADI(아날로그) 등의 수혜 전망. 칩스법 보조금 효과 기대.", magnitude: "상" },
    { order: 3, category: "산업", description: "헬스케어 섹터 옵션 시장 약세 시그널 및 EPS 하향 조정 혼재. BSX, ABBV, ABT, MRK, MDT 등 주요 기업 실적 불확실성 확대.", magnitude: "중" },
    { order: 4, category: "금융", description: "섹터 로테이션 가속화. 에너지·반도체로 자금 유입, 헬스케어에서 자금 유출 가능성. ETF 리밸런싱 영향.", magnitude: "중" },
    { order: 5, category: "산업", description: "에너지 인프라 투자 확대. EPS 개선에 따른 에너지 기업 CAPEX 증가로 유전 서비스·장비 업체 간접 수혜.", magnitude: "중" },
    { order: 6, category: "기술", description: "AI 반도체 수요 확대가 전력 인프라·냉각 장비 등 데이터센터 생태계 전반으로 파급.", magnitude: "하" },
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
    // 에너지 섹터 (수혜)
    { name: "ExxonMobil", ticker: "XOM", exchange: "NYSE", sector: "에너지", reason: "세계 최대 통합 에너지 기업. EPS 컨센서스 대폭 상향 조정. 유가 상승과 정제마진 개선으로 업스트림·다운스트림 모두 실적 개선 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Chevron", ticker: "CVX", exchange: "NYSE", sector: "에너지", reason: "미국 2위 에너지 메이저. EPS 상향 조정. Permian Basin 생산 확대와 유가 상승의 이중 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "ConocoPhillips", ticker: "COP", exchange: "NYSE", sector: "에너지", reason: "순수 E&P(탐사·생산) 기업으로 유가 상승에 가장 직접적 수혜. EPS 컨센서스 상향 반영.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Valero Energy", ticker: "VLO", exchange: "NYSE", sector: "에너지", reason: "미국 최대 독립 정유사. 정제마진 개선으로 EPS 대폭 상향. 크랙 스프레드 확대 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Marathon Petroleum", ticker: "MPC", exchange: "NYSE", sector: "에너지", reason: "미국 최대 정유 능력 보유. 정제마진 개선과 EPS 상향 조정. 미드스트림 자회사 MPLX의 안정적 캐시플로우도 긍정적.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "EOG Resources", ticker: "EOG", exchange: "NYSE", sector: "에너지", reason: "저비용 셰일 생산업체. 유가 상승 시 높은 영업 레버리지. EPS 컨센서스 상향 조정.", benefit_type: "직접수혜", confidence: "높음" },
    // 반도체 섹터 (수혜)
    { name: "Micron Technology", ticker: "MU", exchange: "NASDAQ", sector: "반도체", reason: "HBM(고대역폭 메모리) 수요 급증으로 AI 데이터센터 투자 확대 직접 수혜. EPS 긍정적 수정. 칩스법 보조금 대상.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Applied Materials", ticker: "AMAT", exchange: "NASDAQ", sector: "반도체", reason: "세계 최대 반도체 장비 업체. AI 칩 생산 확대에 따른 장비 수요 증가. EPS 긍정적 수정. 칩스법 수혜 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Analog Devices", ticker: "ADI", exchange: "NASDAQ", sector: "반도체", reason: "아날로그·혼합신호 반도체 선두 기업. 데이터센터·산업용 수요 회복으로 EPS 긍정적 수정.", benefit_type: "직접수혜", confidence: "보통" },
    // 헬스케어 섹터 (피해/주의)
    { name: "Boston Scientific", ticker: "BSX", exchange: "NYSE", sector: "헬스케어", reason: "옵션 시장 약세 시그널 포착. 의료기기 섹터 전반의 EPS 하향 조정 영향. 신중한 접근 필요.", benefit_type: "피해", confidence: "보통" },
    { name: "AbbVie", ticker: "ABBV", exchange: "NYSE", sector: "헬스케어", reason: "Humira 특허 만료 후 바이오시밀러 침투 가속. EPS 하향 조정 혼재. 신규 파이프라인(Skyrizi, Rinvoq) 성장이 관건.", benefit_type: "피해", confidence: "보통" },
    { name: "Abbott Laboratories", ticker: "ABT", exchange: "NYSE", sector: "헬스케어", reason: "진단기기·의료기기 부문 성장 둔화 우려. 헬스케어 섹터 전반 약세 시그널에 노출.", benefit_type: "피해", confidence: "보통" },
    { name: "Merck & Co", ticker: "MRK", exchange: "NYSE", sector: "헬스케어", reason: "Keytruda 매출 집중도 리스크. 헬스케어 섹터 EPS 하향 조정 및 옵션 시장 약세 시그널. 파이프라인 다각화 진행 중.", benefit_type: "피해", confidence: "보통" },
    { name: "Medtronic", ticker: "MDT", exchange: "NYSE", sector: "헬스케어", reason: "의료기기 대형주. 헬스케어 섹터 전반의 약세 분위기 영향. EPS 하향 조정 우려. 사업 구조조정 중.", benefit_type: "피해", confidence: "보통" },
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
    { name: "어닝 시즌", category: "테마" },
    { name: "EPS 컨센서스", category: "테마" },
    { name: "에너지", category: "섹터" },
    { name: "반도체", category: "섹터" },
    { name: "헬스케어", category: "섹터" },
    { name: "유가 상승", category: "테마" },
    { name: "정제마진", category: "섹터" },
    { name: "AI", category: "테마" },
    { name: "데이터센터", category: "테마" },
    { name: "칩스법", category: "테마" },
    { name: "CHIPS Act", category: "테마" },
    { name: "섹터 로테이션", category: "테마" },
    { name: "옵션 시장", category: "테마" },
    { name: "정유", category: "섹터" },
    { name: "의료기기", category: "섹터" },
    { name: "미국", category: "지역" },
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

insertEarningsSectors().catch(console.error);
