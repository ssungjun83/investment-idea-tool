import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertLngInfra() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `[대신증권 박장욱 Industry Report] 호르무즈 이후, LNG 인프라의 시대

미국-이란간의 전쟁으로 호르무즈 봉쇄가 지속되고 있습니다.
전쟁은 시장이 예상하고 있는 대로 단기간내 종료될 수도, 예상보다 장기화될 수도 있는 상황입니다.

본 자료에서는 전쟁의 양상과 상관없이 LNG 및 석유 등 전통 에너지 인프라 업체들이 수혜를 볼 가능성이 높다는 점에 대해서 다뤄보았습니다.
현재 호르무즈 내 원유 및 가스 생산 설비들은 장기간의 생산 중단으로 인해 저류층 손상이 발생한 것으로 추정됩니다.
우드 맥킨지에 따르면, 당장 전쟁이 끝나고 생산이 재개되더라도 수주내 회복가능한 물량은 전쟁전 50% 정도 수준으로 추정하고 있습니다.
이는 단기간내 공급 충격 가능성이 존재하며, 에너지 지형의 구조적인 변화를 일으킬 것으로 예상합니다.

주요 에너지 수입국가들은 러-우 전쟁이후에도 계속되고 있던 에너지 안보차원에서의 LNG 수입처 다변화를 지속하고 있으며, 가장 대표적인 대안 생산지로는 미국 LNG 수출 터미널과 서아프리카 지역의 FLNG가 꼽힙니다.

한국 상장사 중에서 실적 성장과 멀티플 리레이팅이 가능할 것으로 보이는 하이록코리아를 Top-pick으로 관심종목으로 태광과 성광벤드를 제시합니다.

(승도리 코멘트) 기업내용보다는 산업 내용을 보세요. 한텍 SNT 에너지도 있는데... 음`;

  const title = "호르무즈 이후 LNG 인프라 시대 — 한국 피팅·밸브·플랜트 기자재 수혜";

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
      ${"호르무즈 사태 이후 LNG 인프라 CAPEX 사이클 — 한국 피팅·단조·플랜트 기자재 업체 실적 성장 + 멀티플 리레이팅"},
      ${"미국-이란 전쟁으로 호르무즈 해협 봉쇄가 지속되며 글로벌 에너지 공급망에 균열이 발생했다. 호르무즈 내 원유·가스 생산설비들은 장기간 가동 중단으로 저류층(reservoir) 손상이 진행된 것으로 추정되며, 우드 맥킨지에 따르면 전쟁이 종료되어도 수주내 회복 가능한 물량은 전쟁 전의 50% 수준에 불과하다. 이는 일시적 충격이 아닌 에너지 지형의 구조적 변화를 의미한다. 러-우 전쟁 이후 가속되어온 LNG 수입처 다변화 흐름은 더욱 강화될 전망이며, 가장 대표적 대안 생산지는 ① 미국 LNG 수출 터미널, ② 서아프리카 FLNG 프로젝트이다. 한국 상장사 중에서는 LNG 인프라용 피팅·단조·압력용기 기자재 업체들이 실적 성장과 멀티플 리레이팅을 동시에 누릴 수 있는 구간."},
      ${"1) 미-이란 전쟁·호르무즈 봉쇄 지속 → 2) 호르무즈 원유·가스 설비 저류층 손상 (수주 내 회복 50% 수준) → 3) 단기 공급 충격 + 에너지 지형 구조적 변화 → 4) 주요 수입국 LNG 수입처 다변화 가속 → 5) 미국 LNG 수출 터미널 + 서아프리카 FLNG 신규 FID 폭증 → 6) 글로벌 LNG 인프라 CAPEX 사이클 본격 진입 → 7) 한국 피팅·단조·밸브·플랜트 기자재 업체 수주 폭증 → 8) 실적 성장 + 멀티플 리레이팅 동시 진행 → 9) LNG선·FLNG 신규 발주로 한국 조선사 후방 수혜"},
      ${"단기(1-3개월): 호르무즈 봉쇄 지속 시 LNG 현물가격 강세 + 한국 피팅사 수주 모멘텀 본격화. 분기 수주잔고 발표 핵심 트리거. 중기(3-6개월): 미국 LNG 수출 터미널 신규 FID 잇따를 전망 (텍사스·루이지애나). 한국 상장사 수주잔고 큰 폭 확대. 장기(6-12개월): 서아프리카(모잠비크·모리타니아·세네갈) FLNG 프로젝트 본격 발주. 한국 조선사 LNG선·FLNG 수주 슈퍼사이클. 멀티플 리레이팅 지속."},
      ${JSON.stringify([
        "미-이란 전쟁 조기 종결 + 호르무즈 정상화 시 LNG 가격·인프라 모멘텀 약화",
        "미국 LNG 수출 프로젝트 FID 지연 (자금조달·환경 규제·DOE 승인)",
        "미국 천연가스(헨리허브) 공급 부족 시 LNG 수출 라이선스 제약",
        "중국·일본·이탈리아 경쟁 기자재 업체와의 점유율 경쟁 심화",
        "글로벌 에너지 전환 가속으로 LNG 장기 수요 둔화 우려",
        "한국 기업 실적 호조 선반영 후 단기 차익실현 조정 가능",
        "서아프리카 정치적 불안정으로 FLNG 프로젝트 일정 지연 리스크"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "한국 피팅·단조 업체(하이록코리아·태광·성광벤드) 수주 폭증. LNG 터미널·FLNG·파이프라인용 고압 피팅·엘보·플랜지 수요 폭발. 분기별 수주잔고 사상 최대 갱신 가능.", magnitude: "상" },
    { order: 2, category: "산업", description: "미국 LNG 수출 터미널 신규 FID 잇따를 전망. Cheniere·Venture Global·NextDecade 등 글로벌 LNG 메이저 매출·EBITDA 큰 폭 성장.", magnitude: "상" },
    { order: 3, category: "산업", description: "서아프리카 FLNG 프로젝트 본격화. 모잠비크·세네갈·모리타니아 가스전 개발과 FLNG 신규 발주 → 한국 조선사(HD현대중공업·삼성중공업·한화오션) LNG선·FLNG 수주 슈퍼사이클.", magnitude: "상" },
    { order: 4, category: "산업", description: "한국 플랜트 기자재 업체(SNT에너지·한텍) 수주 확대. 압력용기·콜드박스·열교환기·저장탱크 등 LNG 액화·저장 인프라 핵심 부품 수요 증가.", magnitude: "중" },
    { order: 5, category: "산업", description: "LNG 운반선 신규 발주 사이클 강화. 글로벌 LNG 트레이드 물량 증가로 174K급 LNG선 발주 호조 — 한국 조선 빅3 수주 호황 지속.", magnitude: "상" },
    { order: 6, category: "금융", description: "한국 LNG 인프라 관련주 멀티플 리레이팅. 그동안 사이클 종목으로 디스카운트되던 중소 피팅·플랜트 기자재 종목들의 P/E·P/B 동시 확장 구간 진입.", magnitude: "중" },
    { order: 7, category: "산업", description: "미국 셰일가스 E&P 업체 마진 개선. LNG 수출 수요 확대로 헨리허브 가격 강세 + 마셀러스·헤인즈빌 가스 생산 증가. EQT·Range Resources 등 수혜.", magnitude: "중" },
    { order: 8, category: "정책", description: "에너지 안보 차원에서 LNG 수입처 다변화 정책 가속. 한국·일본·EU 등 정부 차원의 장기 LNG 계약 체결 + 인프라 투자 확대. 정책 모멘텀 동반.", magnitude: "중" },
    { order: 9, category: "산업", description: "원유 가격 강세 지속 가능성. 호르무즈 회복 지연 시 글로벌 원유 수급 타이트, 정유·E&P 동반 수혜.", magnitude: "중" },
    { order: 10, category: "산업", description: "후방 자재(밸브·계측기·콜드박스 단열재 등) 수요 동반 증가. 중소 LNG 기자재 협력사 수주 환경 개선.", magnitude: "하" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3: 수혜 기업 ──
  const companies = [
    // ── 한국 피팅·단조 (Top-pick + 관심종목) ──
    { name: "하이록코리아", ticker: "013030.KQ", exchange: "KOSDAQ", sector: "피팅·밸브", reason: "[리포트 Top-pick] 고압 계장용 튜브 피팅·밸브 글로벌 메이저. LNG 터미널·FLNG·해양플랜트 등 고부가 인프라에 핵심 부품 공급. 실적 성장 + 멀티플 리레이팅 동시 가능. 글로벌 점유율 + 마진 양면에서 프리미엄.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "태광", ticker: "023160.KQ", exchange: "KOSDAQ", sector: "피팅·단조", reason: "[리포트 관심종목] LNG·석유화학 플랜트용 단조 피팅(엘보·티·리듀서) 전문. 미국 LNG 수출 터미널·중동 가스 인프라 수주 노출 큼. 사이클 회복기에 분기 수주잔고 큰 폭 증가 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "성광벤드", ticker: "014620.KQ", exchange: "KOSDAQ", sector: "피팅·단조", reason: "[리포트 관심종목] 단조 피팅(엘보·벤드) 전문업체. LNG·해양플랜트 향 수출 비중 높음. 글로벌 LNG 인프라 CAPEX 사이클의 직접 수혜 종목.", benefit_type: "직접수혜", confidence: "높음" },

    // ── 한국 LNG 플랜트 기자재 (승도리 추가 언급) ──
    { name: "SNT에너지", ticker: "100840.KS", exchange: "KRX", sector: "플랜트 기자재", reason: "에너지 플랜트용 핀튜브 열교환기·공기냉각기(ACC) 글로벌 메이저. LNG·석유화학 플랜트 신규 건설 사이클에서 핵심 기자재 공급. 수주잔고 모멘텀 본격화 기대.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한텍", ticker: "143210.KQ", exchange: "KOSDAQ", sector: "플랜트 기자재", reason: "압력용기·반응기·열교환기 전문. LNG·석유화학·수소 플랜트 향 매출. LNG 인프라 CAPEX 확대 사이클에서 수주 모멘텀 강화 기대.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 조선 (LNG선·FLNG 슈퍼사이클) ──
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "세계 최대 LNG선 건조사. 174K급 LNG 운반선 + FLNG 건조 경쟁력 글로벌 1위. 호르무즈 사태로 인한 LNG 트레이드 증가 → LNG선 발주 슈퍼사이클의 핵심 수혜.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "LNG선·FLNG 건조 강자. 모잠비크·세네갈 FLNG 프로젝트 트랙 레코드 보유. 서아프리카 FLNG 발주 본격화 시 직접적 수주 모멘텀.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "LNG선·FLNG 건조 역량. 친환경 추진 LNG선 기술도 강점. LNG 인프라 CAPEX 사이클 + 운반선 발주 동시 수혜.", benefit_type: "간접수혜", confidence: "높음" },

    // ── 미국 LNG 수출 터미널 ──
    { name: "Cheniere Energy", ticker: "LNG", exchange: "NYSE", sector: "LNG 수출", reason: "미국 최대 LNG 수출 업체. 사빈패스·코퍼스크리스티 터미널 운영. 글로벌 LNG 수입 다변화 흐름의 최대 수혜자. 신규 트레인 증설로 추가 성장 여력.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Venture Global LNG", ticker: "VG", exchange: "NYSE", sector: "LNG 수출", reason: "미국 LNG 수출 빠른 성장세 신흥 메이저. Calcasieu Pass·Plaquemines 프로젝트 가동·확장. 사이클 회복기에 가장 가파른 매출 성장 가능.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "NextDecade", ticker: "NEXT", exchange: "NASDAQ", sector: "LNG 수출", reason: "텍사스 Rio Grande LNG 프로젝트 개발사. 추가 트레인 FID 모멘텀 보유. LNG 다변화 흐름에서 신규 공급 옵션으로 부각.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 미국 셰일가스 E&P (LNG 원료 공급) ──
    { name: "EQT Corporation", ticker: "EQT", exchange: "NYSE", sector: "셰일가스 E&P", reason: "미국 최대 천연가스 생산 기업. 마셀러스 셰일 중심. LNG 수출 확대 시 미국 가스 수요·가격 동반 상승의 핵심 수혜.", benefit_type: "간접수혜", confidence: "높음" },
    { name: "Range Resources", ticker: "RRC", exchange: "NYSE", sector: "셰일가스 E&P", reason: "마셀러스 셰일 가스·NGL 생산자. LNG 수출 사이클에서 가스 가격 강세 + NGL 수요 증가 동시 수혜.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 미드스트림 (가스 파이프라인) ──
    { name: "Williams Companies", ticker: "WMB", exchange: "NYSE", sector: "미드스트림", reason: "미국 최대 천연가스 미드스트림. LNG 수출 증가 → 가스 파이프라인 용량 확대 + 신규 건설 사이클. 안정적 캐시플로우 + 성장 모멘텀.", benefit_type: "간접수혜", confidence: "높음" },
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
    { name: "LNG", category: "섹터" },
    { name: "LNG 인프라", category: "테마" },
    { name: "호르무즈", category: "테마" },
    { name: "호르무즈 봉쇄", category: "테마" },
    { name: "미-이란 전쟁", category: "테마" },
    { name: "에너지 안보", category: "테마" },
    { name: "수입처 다변화", category: "테마" },
    { name: "FLNG", category: "테마" },
    { name: "미국 LNG 수출", category: "테마" },
    { name: "피팅", category: "테마" },
    { name: "단조 피팅", category: "테마" },
    { name: "압력용기", category: "테마" },
    { name: "열교환기", category: "테마" },
    { name: "LNG선", category: "테마" },
    { name: "LNG 운반선", category: "테마" },
    { name: "조선", category: "섹터" },
    { name: "플랜트 기자재", category: "섹터" },
    { name: "셰일가스", category: "테마" },
    { name: "셰일가스 E&P", category: "섹터" },
    { name: "천연가스", category: "테마" },
    { name: "헨리허브", category: "테마" },
    { name: "미드스트림", category: "섹터" },
    { name: "파이프라인", category: "테마" },
    { name: "멀티플 리레이팅", category: "테마" },
    { name: "미국", category: "지역" },
    { name: "한국", category: "지역" },
    { name: "서아프리카", category: "지역" },
    { name: "모잠비크", category: "지역" },
    { name: "이란", category: "지역" },
    { name: "중동", category: "지역" },
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

insertLngInfra().catch(console.error);
