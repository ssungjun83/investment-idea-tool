import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertKospiBull() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):

[전달된 채널: 딘스티커 Dean's Ticker]
SK하이닉스 컨콜 中 HBM4 관련 발언:
"HBM 공급은 스피드, 전력 등 성능과 함께 수율 등 공급 안정성이 충족돼야 함.
당사의 HBM4는 주요 고객사와 초기 단계부터 긴밀히 협력해 개발했고 공급망을 구축해왔음.
고객의 요구 성능을 충족하는 제품을 램프업해 적시에 공급할 수 있도록 준비 중임.
향후 3년 동안 당사에 요구하는 HBM 수요는 캐파를 상회하는 수준.
그러나 범용 D램 공급 부족 감안해 범용 D램과 HBM 사이 최적의 배분을 고려할 것"

(승도리 코멘트1) 이래서 반도체를 줄이라고 말을 못하겠음...

(승도리 코멘트2) 진짜 한국 증시가
- 조선 좋고
- 방산 좋고
- 정부 정책이 주주친화적이고 (상법 개정)
- 부동산 저렇게 해놔서 돈 올곳을 주식말고 없게 만들어놨고
- 반도체 좋고
- 원전 좋고
- 변압기 좋고....
내수 위주 사업들 제외하면 다 좋은데...
걸리는게 원재료 수급난(나프타 대란)말곤 없는데...음...`;

  const title = "한국 증시 다중 모멘텀 동시 발동 — HBM·조선·방산·원전·변압기·상법개정";

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
      ${"한국 증시 구조적 리레이팅 — 글로벌 메가트렌드 5종(반도체·조선·방산·원전·변압기) + 주주친화 정책 + 부동산 자금 이동의 다중 모멘텀 동시 발동"},
      ${"2026년 2분기 SK하이닉스 컨콜에서 HBM4가 향후 3년간 고객 수요가 캐파를 상회한다고 공식 발언. 범용 D램까지 공급 부족 국면으로 메모리 양강 슈퍼사이클이 확정됐다. 동시에 한국은 ① 조선(LNG선·FLNG·해양플랜트 슈퍼사이클) ② 방산(글로벌 지정학 갈등 → K-방산 수출 호황) ③ 반도체(HBM + 범용 D램 동시 호조) ④ 원전(SMR·해외 수출) ⑤ 변압기(미국 노후 송전망 교체 + AI 데이터센터 전력 수요)라는 글로벌 메가트렌드 5종 모두에 노출된 유일한 시장이다. 정책 측면에서는 상법 개정·이사 충실의무 확대·자사주 소각 등 주주친화 방향 전환이 진행 중이고, 부동산 규제와 금리 환경이 시중 자금의 자산 이동 채널을 사실상 주식으로 좁혀놓은 구조. 유일하게 신경 쓰이는 변수는 호르무즈 사태에서 비롯된 나프타 대란(석유화학·내수 충격) 정도."},
      ${"1) HBM4 캐파 초과 수요 + 범용 D램 공급 부족 → 메모리 양강 슈퍼사이클 → 2) LNG 인프라 시대 + 호르무즈 사태 → 한국 조선 빅3 LNG선·FLNG 슈퍼사이클 → 3) 글로벌 지정학 갈등 → K-방산 수출 폭증(폴란드·중동·동남아) → 4) AI 데이터센터 + 산업 전력 수요 → 원전 르네상스(SMR) + 변압기 슈퍼사이클(미국 송전망 교체 사이클) → 5) 상법 개정·자사주 소각·배당 확대 → 코리아 디스카운트 해소 → 6) 부동산 규제·금리 → 가계 자산이 주식으로 이동 → 7) 외국인 자금 유입 가속 → 8) 다중 모멘텀 동시 발동으로 한국 증시 구조적 리레이팅(PER 멀티플 상향) → 9) 단, 나프타 대란발 석유화학·내수 부진은 별도 옵션 헤지 필요"},
      ${"단기(1-3개월): SK하이닉스·삼성전자 HBM4 양산 본격화, 미국 변압기 수출 호조, K-방산 신규 수주 공시 잇따를 전망. 코스피 사상 최고치 갱신 시도. 중기(3-6개월): 상법 개정 시행, 자사주 소각·배당 확대 본격화. 외국인 자금 유입 가속화로 외국인 보유율 상승. 부동산 → 주식 자금 이동 가시화. 장기(6-12개월): 한국 증시 PER 멀티플의 구조적 상향(코리아 디스카운트 해소). 글로벌 자산배분에서 한국 비중 확대. 단 나프타 대란 진정 여부가 단기 변동성 변수."},
      ${JSON.stringify([
        "호르무즈발 나프타 대란이 석유화학·물류·내수 인플레이션으로 확산되어 매크로 부담 가중",
        "HBM 가격 일부 조정 리스크 (CSP 자본지출 축소·AI 버블 우려 시)",
        "미국 관세·무역 분쟁 재점화 (반도체·조선·자동차·방산 동시 노출)",
        "상법 개정 국회 통과 지연 또는 내용 약화로 주주친화 모멘텀 둔화",
        "부동산 규제 완화 시 자금 다시 부동산으로 회귀",
        "AI 데이터센터 CAPEX 둔화 가능성으로 변압기·전력 사이클 약화",
        "내수 부진 장기화로 내수주 디스카운트 확대",
        "원·달러 환율 급변동 시 외국인 자금 이탈",
        "조선 슈퍼사이클 후반 진입 시점 식별 어려움 (수주잔고 피크 신호 모니터링 필요)"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "HBM4 슈퍼사이클 — SK하이닉스·삼성전자 매출·EBITDA 사상 최고치 갱신 가능. 향후 3년 캐파 초과 수요 확정으로 가격 결정력·마진 동시 확대.", magnitude: "상" },
    { order: 2, category: "산업", description: "범용 D램 공급 부족 — HBM 라인 전환으로 범용 D램 공급 타이트. 가격 동반 강세로 메모리 부문 전체 마진 레버리지 극대화.", magnitude: "상" },
    { order: 3, category: "산업", description: "한국 조선 빅3 LNG선·FLNG·해양플랜트 슈퍼사이클. 호르무즈 사태 + LNG 인프라 다변화로 발주 폭증. HD한국조선해양·삼성중공업·한화오션 수주잔고 사상 최대.", magnitude: "상" },
    { order: 4, category: "산업", description: "K-방산 글로벌 수출 호황. 폴란드·중동·동남아 향 K2전차·K9자주포·천궁·FA-50 수출. 한화에어로·LIG넥스원·KAI·현대로템 수주잔고 폭증.", magnitude: "상" },
    { order: 5, category: "산업", description: "원전 르네상스 — SMR(소형모듈원전) + 해외 원전 수출. 두산에너빌리티·한전기술 등 핵심 기자재·설계 업체 수주 확대. AI 데이터센터 전력원으로도 부각.", magnitude: "상" },
    { order: 6, category: "산업", description: "변압기 슈퍼사이클 — 미국 노후 송전망 교체 사이클 + AI 데이터센터 전력 수요 + 인프라 투자. HD현대일렉트릭·LS일렉트릭·효성중공업 미국 수출 단가 사상 최고.", magnitude: "상" },
    { order: 7, category: "정책", description: "상법 개정·이사 충실의무 확대·자사주 소각 의무화 등 주주친화 정책 본격화. 코리아 디스카운트 해소의 정책 트리거.", magnitude: "상" },
    { order: 8, category: "금융", description: "부동산 → 주식 자금 이동. 부동산 규제 + 금리 환경으로 시중 자금이 주식으로 유입. 코스피·코스닥 거래대금 사상 최대 갱신 가능.", magnitude: "상" },
    { order: 9, category: "산업", description: "HBM 후공정·소부장 호황 — 한미반도체(TC본더), 이오테크닉스(레이저), 하나마이크론(패키징) 등 HBM 밸류체인 전반 수혜.", magnitude: "상" },
    { order: 10, category: "금융", description: "외국인 자금 유입 가속. 한국 ETF(EWY) 자금 유입 + 글로벌 자산배분 한국 비중 확대. MSCI 선진국 편입 논의 재점화.", magnitude: "중" },
    { order: 11, category: "산업", description: "내수 위주 사업(유통·식음료·생활용품·일부 통신) 상대적 부진. 매크로 호조에서 소외되며 디스카운트 확대 가능.", magnitude: "중" },
    { order: 12, category: "산업", description: "석유화학·정유 부문 호르무즈발 나프타 충격 지속. LG화학·롯데케미칼 등 NCC 기반 화학사 부진 (앞선 ECC 스프레드·공급 다이어트 아이디어와 연동).", magnitude: "중" },
    { order: 13, category: "산업", description: "지주회사 재평가 — 상법 개정으로 지배구조·자사주 정책 개선 시 지주사 NAV 디스카운트 축소. 삼성물산·SK·LG 등 재평가.", magnitude: "중" },
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
    // ── 반도체 (HBM·메모리) ──
    { name: "SK하이닉스", ticker: "000660.KS", exchange: "KRX", sector: "반도체", reason: "HBM4 캐파 초과 수요 공식 확정. 향후 3년 수요가 공급 상회하는 슈퍼사이클 진입. 메모리 양강 중 HBM 선두주자로 가장 직접적 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성전자", ticker: "005930.KS", exchange: "KRX", sector: "반도체", reason: "HBM4 품질 인증 + 범용 D램 공급 부족의 양면 수혜. HBM 점유율 회복 + 범용 D램 가격 강세 + 파운드리·시스템LSI까지 종합 모멘텀. 한국 시총 1위로 코스피 지수 영향력 최대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한미반도체", ticker: "042700.KS", exchange: "KRX", sector: "반도체 장비", reason: "HBM 후공정 핵심 장비(TC본더) 글로벌 메이저. HBM4 양산 본격화 시 본더 신규 수주 폭증. SK하이닉스 + 마이크론 + 삼성 모두에 공급 가능.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "이오테크닉스", ticker: "039030.KQ", exchange: "KOSDAQ", sector: "반도체 장비", reason: "반도체 레이저 마킹·드릴링 장비. HBM 패키징 공정 핵심 장비 공급. HBM 캐파 증설 사이클의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "하나마이크론", ticker: "067310.KQ", exchange: "KOSDAQ", sector: "반도체 후공정", reason: "메모리·시스템 반도체 후공정(패키징·테스트) 전문. HBM 패키징 수요 증가의 간접 수혜.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 조선 ──
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "세계 최대 조선사. LNG선·FLNG·해양플랜트 슈퍼사이클의 핵심. 호르무즈 사태로 인한 LNG 트레이드 증가 + 미국 LNG 수출 터미널 발주의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "LNG선·FLNG 강자. 모잠비크·세네갈 FLNG 트랙 레코드. 서아프리카 FLNG 발주 본격화 시 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "LNG선·FLNG·VLEC + 방산(잠수함) 복합 노출. 다중 모멘텀 종목으로 한국 매크로 테제의 핵심 베타.", benefit_type: "직접수혜", confidence: "높음" },

    // ── 방산 ──
    { name: "한화에어로스페이스", ticker: "012450.KS", exchange: "KRX", sector: "방산", reason: "K9 자주포·레드백 장갑차 글로벌 수출 메이저. 폴란드 대규모 계약 + 중동·동남아 신규 수주 모멘텀. 우주항공·엔진까지 포트폴리오 다각화.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "LIG넥스원", ticker: "079550.KS", exchange: "KRX", sector: "방산", reason: "천궁·해궁 등 정밀유도무기 강자. 중동향 천궁 대규모 수출. 글로벌 미사일·방공 수요 사이클의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한국항공우주(KAI)", ticker: "047810.KS", exchange: "KRX", sector: "방산·항공", reason: "FA-50 경공격기·KF-21 차세대 전투기 개발. 동남아·중동·중남미 FA-50 수출 모멘텀. 항공우주 부문 추가 옵션.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "현대로템", ticker: "064350.KS", exchange: "KRX", sector: "방산·철도", reason: "K2 전차 글로벌 수출 메이저. 폴란드 K2 추가 계약 + 동남아·중동향 수출 모멘텀. 철도 부문도 안정적 수익원.", benefit_type: "직접수혜", confidence: "높음" },

    // ── 원전 ──
    { name: "두산에너빌리티", ticker: "034020.KS", exchange: "KRX", sector: "원전·발전", reason: "한국 원전 핵심 기자재 메이저. SMR(NuScale) 프로젝트 + 해외 원전 수출 + 가스터빈까지 노출. 원전 르네상스의 핵심 수혜주.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한전기술", ticker: "052690.KS", exchange: "KRX", sector: "원전 설계", reason: "원전 설계 전문 자회사. 신규 원전 발주 + SMR 설계 모멘텀의 직접 수혜.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 변압기·전력 ──
    { name: "HD현대일렉트릭", ticker: "267260.KS", exchange: "KRX", sector: "전력기기", reason: "미국 송전망 교체 + AI 데이터센터 전력 수요로 변압기 슈퍼사이클의 최대 수혜. 미국 수출 단가 사상 최고. 백로그 수년치 확보.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "LS일렉트릭", ticker: "010120.KS", exchange: "KRX", sector: "전력기기", reason: "변압기·배전반·전력 솔루션 통합. 미국 인프라 + 데이터센터 수요 직접 노출. ESS·전기차 인프라까지 다중 모멘텀.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "효성중공업", ticker: "298040.KS", exchange: "KRX", sector: "전력기기", reason: "초고압 변압기 강자. 북미·중동 수출 비중 높음. 송전망 + 데이터센터 사이클 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },

    // ── 주주환원·지주사 (상법 개정 수혜) ──
    { name: "삼성물산", ticker: "028260.KS", exchange: "KRX", sector: "지주", reason: "삼성그룹 지배구조 핵심. 상법 개정·자사주 소각 의무화 시 NAV 디스카운트 축소의 가장 큰 수혜 지주사 중 하나.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "SK스퀘어", ticker: "402340.KS", exchange: "KRX", sector: "지주", reason: "SK그룹 ICT 투자지주. SK하이닉스 보유 가치가 핵심. HBM 슈퍼사이클 + 주주환원 정책 결합의 다중 모멘텀.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 피해 / 상대 약세 (나프타 대란·내수) ──
    { name: "LG화학", ticker: "051910.KS", exchange: "KRX", sector: "석유화학", reason: "한국 매크로 호조에서 소외된 NCC 화학사. 나프타 대란 + ECC 스프레드 확대로 화학 부문 직격탄. 다만 배터리 소재가 일부 상쇄 (앞 ECC·공급 다이어트 아이디어와 연동).", benefit_type: "피해", confidence: "높음" },
    { name: "롯데케미칼", ticker: "011170.KS", exchange: "KRX", sector: "석유화학", reason: "순수 NCC 화학사로 나프타 대란의 가장 직접적 피해. 한국 매크로 호조 테제의 유일한 약점 섹터를 대표.", benefit_type: "피해", confidence: "높음" },
    { name: "이마트", ticker: "139480.KS", exchange: "KRX", sector: "유통", reason: "내수 위주 사업으로 한국 매크로 호조 테제에서 상대적 소외. 식품 인플레이션 + 내수 부진 양면 부담.", benefit_type: "피해", confidence: "보통" },
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
    { name: "한국 증시", category: "테마" },
    { name: "코스피", category: "테마" },
    { name: "코리아 디스카운트", category: "테마" },
    { name: "멀티플 리레이팅", category: "테마" },
    { name: "주주환원", category: "테마" },
    { name: "상법 개정", category: "테마" },
    { name: "이사 충실의무", category: "테마" },
    { name: "자사주 소각", category: "테마" },
    { name: "지주회사", category: "섹터" },
    { name: "부동산 규제", category: "테마" },
    { name: "자금 이동", category: "테마" },
    { name: "외국인 수급", category: "테마" },
    { name: "HBM", category: "테마" },
    { name: "HBM4", category: "테마" },
    { name: "DRAM", category: "테마" },
    { name: "반도체", category: "섹터" },
    { name: "반도체 장비", category: "섹터" },
    { name: "후공정", category: "테마" },
    { name: "TC본더", category: "테마" },
    { name: "조선", category: "섹터" },
    { name: "LNG선", category: "테마" },
    { name: "FLNG", category: "테마" },
    { name: "해양플랜트", category: "테마" },
    { name: "방산", category: "섹터" },
    { name: "K-방산", category: "테마" },
    { name: "원전", category: "섹터" },
    { name: "SMR", category: "테마" },
    { name: "변압기", category: "테마" },
    { name: "전력기기", category: "섹터" },
    { name: "송전망", category: "테마" },
    { name: "AI 데이터센터", category: "테마" },
    { name: "AI", category: "테마" },
    { name: "나프타", category: "테마" },
    { name: "나프타 대란", category: "테마" },
    { name: "석유화학", category: "섹터" },
    { name: "내수", category: "섹터" },
    { name: "유통", category: "섹터" },
    { name: "한국", category: "지역" },
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

insertKospiBull().catch(console.error);
