import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertDeepwater() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 1분기 (1/12-4/10):
High-impact wells by region, 2026 차트 분석.
아프리카·남미 쪽에 deep water & UDW(심해·초심해) 개발 건수가 상당히 늘 것을 알 수 있음.
오히려 얕은 연안이나 육상 프로젝트는 거의 없다시피 함.
심해 시추 장비회사 수혜 전망: #FTI #BKR #WFRD
2026년 지역별 high-impact wells — 아프리카와 남미가 deepwater·ultra-deepwater 비중 압도적.`;

  const title = "심해 시추 개발 급증 — 아프리카·남미 중심 장비회사 수혜";

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
      ${"2026년 심해·초심해(Deepwater/UDW) 시추 개발 급증에 따른 해양 장비 업체 수혜 분석"},
      ${"2026년 지역별 high-impact wells 데이터에 따르면 아프리카와 남미에서 deepwater(수심 500~1,500m) 및 ultra-deepwater(1,500m+) 시추 개발 건수가 급증하고 있다. 반면 얕은 연안(shelf)이나 육상(land) 프로젝트는 거의 없는 상황이다. 이는 글로벌 E&P 기업들이 고부가가치 심해 유전 개발에 집중 투자하고 있음을 의미하며, 심해 시추 장비·서비스 기업들의 수주 확대로 직결된다."},
      ${"1) 글로벌 E&P 기업 심해·초심해 개발 투자 확대 → 2) 아프리카·남미 중심 deepwater/UDW 시추 건수 급증 → 3) 심해 시추 장비(subsea tree, BOP 등) 및 서비스 수요 폭증 → 4) 장비회사(FTI, BKR, WFRD) 수주 확대 및 실적 개선 → 5) 심해 시추선(드릴십) 발주 증가 → 한국 조선사 수혜 → 6) 얕은 연안·육상 프로젝트 감소로 전통 육상 장비 업체는 상대적 부진"},
      ${"단기(1-3개월): 심해 장비 수주 공시 및 백로그 증가 확인 기대. 중기(3-6개월): 아프리카·남미 심해 프로젝트 FID(최종투자결정) 잇따를 전망. 장비회사 실적 반영. 장기(6-12개월): 드릴십·FPSO 신규 발주 사이클 본격화. 한국 조선사 수주 모멘텀 지속."},
      ${JSON.stringify([
        "유가 급락 시 E&P 기업 심해 개발 투자 축소·연기 가능",
        "아프리카·남미 정치적 불안정으로 프로젝트 지연 리스크",
        "심해 시추 비용 상승으로 경제성 악화 가능",
        "환경 규제 강화로 심해 개발 허가 지연",
        "기존 장비 재활용 증가 시 신규 장비 수요 둔화"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "심해 시추 장비(subsea, BOP, 라이저 등) 수요 급증. 아프리카·남미 deepwater/UDW 프로젝트 증가로 FTI, BKR, WFRD 등 장비회사 수주 폭증 기대.", magnitude: "상" },
    { order: 2, category: "산업", description: "드릴십·FPSO 신규 발주 증가. 심해 개발 확대로 시추선 및 부유식 생산설비 수요 증가 → 한국 조선사 수혜.", magnitude: "상" },
    { order: 3, category: "산업", description: "얕은 연안·육상 프로젝트 감소. 전통 육상 시추 장비 업체 상대적 부진. 투자 포커스가 심해로 이동.", magnitude: "중" },
    { order: 4, category: "기술", description: "심해 기술(subsea processing, 디지털 트윈 등) 수요 확대. 기술 선도 기업 프리미엄 부각.", magnitude: "중" },
    { order: 5, category: "산업", description: "해양 플랜트 엔지니어링·설치 서비스 수요 증가. 해양 EPC 업체 간접 수혜.", magnitude: "중" },
    { order: 6, category: "금융", description: "심해 개발 프로젝트 파이낸싱 증가. 에너지 프로젝트 금융 활성화.", magnitude: "하" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3: 수혜/피해 기업 (미국/한국 상장만) ──
  const companies = [
    // 심해 장비·서비스 (직접 수혜)
    { name: "TechnipFMC", ticker: "FTI", exchange: "NYSE", sector: "해양 장비", reason: "세계 최대 subsea 장비 업체. 심해 시추에 필수적인 subsea tree, 매니폴드, 라이저 등 공급. 아프리카·남미 deepwater 프로젝트 급증으로 수주 백로그 확대 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Baker Hughes", ticker: "BKR", exchange: "NASDAQ", sector: "유전 서비스", reason: "글로벌 3대 유전 서비스 기업. 심해 시추 장비·기술 서비스 제공. LNG 장비도 강점. 심해 개발 확대로 전 부문 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Weatherford International", ticker: "WFRD", exchange: "NASDAQ", sector: "유전 서비스", reason: "유전 서비스·장비 전문 기업. 심해 시추 시 필수적인 케이싱·시멘팅·완결 장비 공급. 심해 프로젝트 증가로 매출 성장 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "SLB (Schlumberger)", ticker: "SLB", exchange: "NYSE", sector: "유전 서비스", reason: "세계 최대 유전 서비스 기업. 심해 시추 기술·디지털 솔루션 선도. 아프리카·남미 심해 프로젝트에서 기술 서비스 계약 확대.", benefit_type: "직접수혜", confidence: "높음" },
    // 심해 시추선 운영 (직접 수혜)
    { name: "Transocean", ticker: "RIG", exchange: "NYSE", sector: "심해 시추", reason: "세계 최대 심해 시추선(드릴십) 보유 업체. deepwater/UDW 시추 건수 급증으로 일일 용선료 상승 및 가동률 개선 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Noble Corporation", ticker: "NE", exchange: "NYSE", sector: "심해 시추", reason: "프리미엄 심해 시추선 운영 업체. 아프리카·남미 심해 프로젝트 증가로 장기 계약 확보 및 일일 용선료 상승 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Valaris", ticker: "VAL", exchange: "NYSE", sector: "심해 시추", reason: "대형 해양 시추선 운영 업체. 심해·초심해 드릴십 보유. 시추 수요 증가로 가동률·용선료 동반 개선 전망.", benefit_type: "직접수혜", confidence: "보통" },
    // 한국 조선사 (간접 수혜 — 드릴십·FPSO 수주)
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "세계 최대 조선사. 드릴십·FPSO 건조 경쟁력 세계 1위. 심해 개발 확대로 해양 플랜트 발주 증가 시 수주 모멘텀 강화.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "드릴십 건조 실적 세계 최다. 심해 시추선 수요 증가로 해양 부문 수주 회복 기대. FPSO 수주도 가능.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "FPSO·드릴십 건조 역량 보유. 심해 개발 프로젝트 확대로 해양 플랜트 수주 기회 증가.", benefit_type: "간접수혜", confidence: "보통" },
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
    { name: "심해 시추", category: "테마" },
    { name: "Deepwater", category: "테마" },
    { name: "해양 장비", category: "섹터" },
    { name: "유전 서비스", category: "섹터" },
    { name: "조선", category: "섹터" },
    { name: "드릴십", category: "테마" },
    { name: "FPSO", category: "테마" },
    { name: "아프리카", category: "지역" },
    { name: "남미", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
    { name: "E&P", category: "섹터" },
    { name: "subsea", category: "테마" },
    { name: "해양 플랜트", category: "섹터" },
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

insertDeepwater().catch(console.error);
