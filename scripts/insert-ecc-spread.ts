import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertEccSpread() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):
위에 보시면 가장 기초유분들 나프타가 없어서 에틸렌-나프타 스프레드가 엄청나게 벌어져있음.

지금은 가스 기반 ECC 업체 특히 북미업체들만 제대로 생산이 가능하고
아시아쪽 NCC 기반 (석유기반)은 지금 제대로 원재료를 못구해서 생산 차질이 된다고 보심 됨.
그럼 투자할거면 북미쪽 ECC 업체들 찾으면 되겠죠?

[석유화학 원료 흐름 다이어그램]
- 천연가스 → 에탄 → ECC(에탄분해, Ethane Cracking Center) → 약 80% 에틸렌 → PE
- 석탄 → 메탄올 → CTO(석탄분해, Coal to Olefins) → 100% 에틸렌
- 원유 → 납사 → NCC(납사분해, Naphtha Cracking Center) → 30% 에틸렌, 15% 프로필렌, 11% C4, 24% BTX(벤젠/톨루엔/자일렌)
- 에틸렌 → PE / EDC, EO 등
- 프로필렌 → PP / AN, PO 등
- 벤젠 → SM, 페놀 등 / 톨루엔 → DNT / 자일렌 → PX, OX 등`;

  const title = "에틸렌-나프타 스프레드 확대 — 북미 ECC 업체 수혜, 아시아 NCC 직격탄";

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
      ${"나프타 공급 부족·에틸렌-나프타 스프레드 확대 → 셰일가스 기반 북미 ECC 업체 구조적 수혜"},
      ${"2026년 2분기 들어 글로벌 나프타 공급 부족이 심화되며 에틸렌-나프타 스프레드가 역사적 수준으로 확대되었다. 석유화학의 핵심 기초유분인 에틸렌은 ① 나프타분해(NCC, 원유→납사 기반, 아시아 주력) ② 에탄분해(ECC, 천연가스→에탄 기반, 북미 주력) ③ 석탄분해(CTO, 석탄→메탄올 기반, 중국)의 3가지 경로로 생산된다. 현재 아시아 NCC 업체들은 나프타 원재료 확보 차질로 가동률이 급락한 반면, 북미 ECC 업체들은 풍부한 셰일가스에서 추출한 에탄을 원료로 정상 가동 중이다. 이로 인해 북미 ECC 업체들이 글로벌 에틸렌·PE 시장에서 가격 결정력과 시장 점유율을 동시에 확대하는 구조적 수혜 국면에 진입했다."},
      ${"1) 글로벌 나프타 공급 타이트 + 정유 가동률 조정으로 나프타 가격 강세 → 2) 에틸렌-나프타 스프레드 역대 수준으로 확대 → 3) 아시아 NCC 업체(LG화학·롯데케미칼·중국 NCC 등) 원재료 확보 차질로 가동률 하락·마진 압축 → 4) 북미 ECC 업체(Dow·LyondellBasell·Westlake)는 셰일가스 기반 에탄으로 원가 안정 + 정상 가동 → 5) 에틸렌·PE 수출 증대로 글로벌 점유율 확대 → 6) 마진 확대 + 물량 증가의 더블 레버리지 → 7) 중기적으로 아시아 노후 NCC 구조조정 압력 가속화 → 8) 북미·중동 ECC 신증설 사이클 진입"},
      ${"단기(1-3개월): 에틸렌-나프타 스프레드 추가 확대 가능. 북미 ECC 업체 2~3분기 실적 서프라이즈 기대. 아시아 NCC 업체 가동률 추가 하락 및 정기보수 앞당기기. 중기(3-6개월): 아시아 일부 노후 NCC 가동 중단·구조조정 본격화. 북미 PE 아시아·유럽 수출 급증. 장기(6-12개월): 북미·중동 ECC 신증설 발표 잇따를 전망. 글로벌 에틸렌 공급 구조의 ECC 비중 확대로 산업 패러다임 전환."},
      ${JSON.stringify([
        "나프타 공급 정상화 시 스프레드가 빠르게 축소되며 모멘텀 소멸 가능",
        "미국 천연가스(헨리허브) 가격 급등 시 ECC 원가도 상승해 마진 압축",
        "중국 CTO(석탄분해) 설비 대규모 증설로 에틸렌 공급 과잉 재현 가능",
        "글로벌 경기 침체 심화 시 PE·PP 등 다운스트림 수요 둔화",
        "관세·무역 분쟁(미·중, 미·EU)으로 북미 PE 수출 차질 가능",
        "환경 규제 강화로 ECC 신증설 인허가 지연",
        "에탄 인프라(파이프라인·터미널) 병목 시 북미 ECC도 가동 제약"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "북미 ECC 업체 에틸렌·PE 마진 폭증. 셰일가스 기반 저원가 + 에틸렌-나프타 스프레드 확대로 더블 레버리지 효과. Dow·LyondellBasell·Westlake 등 2~3분기 실적 서프라이즈 가능성.", magnitude: "상" },
    { order: 2, category: "산업", description: "아시아 NCC 업체 가동률 하락 + 마진 압축 직격탄. 한국(LG화학·롯데케미칼·한화솔루션·금호석유), 일본·대만·중국 NCC 업체 실적 부진 심화. 일부는 정기보수 앞당겨 가동률 조정.", magnitude: "상" },
    { order: 3, category: "산업", description: "북미 PE 글로벌 수출 급증. 휴스턴·뉴올리언스 PE 수출 터미널 가동률 상승. 글로벌 에틸렌·PE 가격 결정력이 미국으로 이동.", magnitude: "상" },
    { order: 4, category: "산업", description: "미국 셰일가스 E&P 업체 에탄 수요 증가 수혜. 에탄 가격 점진 상승으로 마셀러스·이글포드 등 가스 풍부 광구의 액화천연가스(NGL) 매출 개선.", magnitude: "중" },
    { order: 5, category: "산업", description: "에탄 운반선(VLEC, Very Large Ethane Carrier) 운임 상승. 미국→중국·유럽 에탄 수출 물량 증가로 VLEC 신규 발주 가능성. 한국 조선사 수혜.", magnitude: "중" },
    { order: 6, category: "산업", description: "중장기적 아시아 NCC 구조조정 가속. 노후 설비 폐쇄·M&A·합작 사례 증가. 중국·일본·한국 석유화학 산업 재편.", magnitude: "중" },
    { order: 7, category: "금융", description: "한국 석유화학 대기업(LG화학·롯데케미칼) 신용등급 하향 압력. 회사채 스프레드 확대 가능. 반대로 북미 화학사 신용등급 우호적 재평가.", magnitude: "중" },
    { order: 8, category: "산업", description: "중국 CTO(석탄분해) 업체 가동률 상승 압박. 석탄 가격 상승 시 CTO도 원가 부담이지만 NCC 대비 상대 우위. 신규 CTO 증설 검토 가능성.", magnitude: "중" },
    { order: 9, category: "기술", description: "가스 기반 분해 기술(ECC, MTO) 경쟁력 부각. 신규 ECC 프로젝트 엔지니어링·EPC 수주 증가 — Lummus·KBR·McDermott 등 라이선서 수혜.", magnitude: "하" },
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
    // ── 북미 ECC 직접수혜 ──
    { name: "Dow Inc.", ticker: "DOW", exchange: "NYSE", sector: "석유화학", reason: "세계 최대 에틸렌 생산자. 미국 걸프 코스트(텍사스 프리포트 등)에 대규모 ECC 보유. 셰일가스 기반 저원가 에탄을 원료로 사용하여 에틸렌-나프타 스프레드 확대 시 직접적 마진 수혜. PE 다운스트림까지 수직 통합되어 있어 가격 전가력도 강함.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "LyondellBasell Industries", ticker: "LYB", exchange: "NYSE", sector: "석유화학", reason: "북미 최대 PE/PP 생산자 중 하나. 텍사스·루이지애나 ECC 다수 운영. 셰일가스 기반 에탄 활용으로 글로벌 NCC 대비 압도적 원가 우위. 글로벌 PE 수출 증대 시 매출·이익 동반 확대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Westlake Corporation", ticker: "WLK", exchange: "NYSE", sector: "석유화학", reason: "미국 ECC 통합 사업자. 에틸렌·PE·PVC를 수직 통합 생산. 에탄 기반 저원가 구조로 에틸렌 마진 확대 시 직접 수혜. 다운스트림 PVC도 동시에 강세를 보일 가능성.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "ExxonMobil", ticker: "XOM", exchange: "NYSE", sector: "통합 에너지", reason: "베이타운·베이포트 ECC 메가플랜트 운영. 화학 사업부(ExxonMobil Chemical)가 에틸렌·PE의 글로벌 메이저. E&P+정제+화학 통합 모델로 ECC 마진 확대 시 화학 부문 실적 견인.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Chevron", ticker: "CVX", exchange: "NYSE", sector: "통합 에너지", reason: "Chevron Phillips Chemical(CPChem) 지분 50% 보유. CPChem은 미국 최대 에틸렌·PE 생산사 중 하나로 ECC 기반. 화학 사업 지분법 이익 통한 간접적이지만 명확한 수혜.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 미국 셰일가스 E&P 간접수혜 (에탄 공급) ──
    { name: "EOG Resources", ticker: "EOG", exchange: "NYSE", sector: "셰일가스 E&P", reason: "미국 최대 셰일 E&P 중 하나. 에탄을 포함한 NGL(액화천연가스) 생산 비중이 높아 ECC 가동률 상승에 따른 에탄 수요 증가의 간접 수혜.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "Range Resources", ticker: "RRC", exchange: "NYSE", sector: "셰일가스 E&P", reason: "마셀러스 셰일의 대표 가스 생산자. 미국에서 에탄 생산 비중이 가장 높은 기업 중 하나. ECC 수요 확대 시 에탄 가격 상승으로 NGL 매출 개선.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 한국 조선사 (VLEC 발주 간접수혜) ──
    { name: "HD현대중공업", ticker: "329180.KS", exchange: "KRX", sector: "조선", reason: "VLEC(대형 에탄운반선) 건조 경쟁력 글로벌 최상위. 미국→아시아·유럽 에탄 수출 물량 확대 시 VLEC 신규 발주 사이클 도래 가능. 가스선 수주 모멘텀 강화.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "VLEC·LNG선 건조 역량 보유. 에탄 수출 인프라 확대 사이클에서 가스선 발주 증가 시 수주 기회. 친환경 추진 가스선 기술도 강점.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 아시아 NCC 피해 (한국) ──
    { name: "LG화학", ticker: "051910.KS", exchange: "KRX", sector: "석유화학", reason: "한국 최대 NCC 보유. 여수·대산 NCC 기반으로 에틸렌·PE 생산. 나프타 원재료 확보 차질 + 북미 ECC와의 마진 격차 확대로 화학 부문 실적 직격탄. 배터리 소재가 일부 상쇄하나 화학 본업 부진 불가피.", benefit_type: "피해", confidence: "높음" },
    { name: "롯데케미칼", ticker: "011170.KS", exchange: "KRX", sector: "석유화학", reason: "여수·대산 NCC 기반의 순수 석유화학 업체. 사업 다각화가 제한적이라 NCC 마진 악화 시 가장 직접적 피해. 신용등급 하향 압력도 가장 큼.", benefit_type: "피해", confidence: "높음" },
    { name: "금호석유화학", ticker: "011780.KS", exchange: "KRX", sector: "석유화학", reason: "여수 NCC 기반. 합성고무·페놀유도체가 주력이나 BTX·올레핀 마진 압박을 동시에 받음. 북미 대비 원가 경쟁력 약화.", benefit_type: "피해", confidence: "보통" },
    { name: "한화솔루션", ticker: "009830.KS", exchange: "KRX", sector: "석유화학", reason: "케미칼 사업이 NCC 기반. 신재생(태양광) 부문이 일부 상쇄하나 화학 부문 마진 압축은 동일하게 발생. PVC·가성소다 통합 사업도 원재료 부담.", benefit_type: "피해", confidence: "보통" },
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
    { name: "에틸렌", category: "테마" },
    { name: "나프타", category: "테마" },
    { name: "에틸렌-나프타 스프레드", category: "테마" },
    { name: "ECC", category: "기술" },
    { name: "NCC", category: "기술" },
    { name: "CTO", category: "기술" },
    { name: "석유화학", category: "섹터" },
    { name: "셰일가스", category: "테마" },
    { name: "에탄", category: "테마" },
    { name: "천연가스", category: "테마" },
    { name: "PE", category: "테마" },
    { name: "프로필렌", category: "테마" },
    { name: "BTX", category: "테마" },
    { name: "원료 다변화", category: "테마" },
    { name: "산업 구조조정", category: "테마" },
    { name: "VLEC", category: "테마" },
    { name: "셰일가스 E&P", category: "섹터" },
    { name: "조선", category: "섹터" },
    { name: "북미", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "아시아", category: "지역" },
    { name: "한국", category: "지역" },
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

insertEccSpread().catch(console.error);
