import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertEnergyOverweight() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):

이렇게 흘러가고 있다
이게 실물 경기에 얼마나 큰 영향을 미칠까... 고민도 해보셔야되고... 참
모르는 사람들이야 다 지나간거 아니냐라고 할 수 있는데
실제로 지금 나오는 데이터들은 상황이 그리 녹록치가 않다는거만 계속 나오고 있으니까

뭐 진짜 적어도 레버리지는 끄십시오.

저는 반도체도 좋게보지만... 어... 글쎄요
이대로 흘러가면 원재료 못구해서 공장 스톱될수도 있는데 라는 생각이 계속 듭니다.

아무튼 말씀드린대로 저는 에너지 비중을 계속 늘릴 예정
(석탄 / 석유 / 비료 / 가스 / 장비 / 조선 / 해운 / 시추 등등등 정말 많으니
pick은 여러분들이 알아서...)

반도체도 좋습니다 나쁘다고 한적 없고... 방산도 좋죠...

레버리지만 쓰지마세요`;

  const title = "에너지 8개 섹터 비중 확대 + 레버리지 축소 — 매크로 우려·공급 충격 헤지 포트폴리오";

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
      ${"매크로 우려·공급 충격 헤지 포트폴리오 — 에너지 8개 하위 섹터(석탄·석유·비료·가스·장비·조선·해운·시추) 분산 비중 확대 + 레버리지 축소 (자금관리 우선)"},
      ${"호르무즈 사태 등 지정학 리스크가 실물 경기로 점차 확산되는 가운데 매크로 데이터들이 녹록치 않은 상황을 지속적으로 시사. 호르무즈발 나프타 대란이 이대로 진행되면 반도체 등 제조업 공장도 원재료 수급 차질로 가동 중단까지 갈 수 있다는 우려가 존재한다. 한국 매크로 호조 테제(반도체·조선·방산·원전·변압기)는 여전히 유효하지만, 그 안에서도 가장 안전한 헷지 전략은 ① 레버리지 축소(현금 비중 확대·반대매매 회피) ② 에너지 섹터 비중 확대(인플레이션·공급충격 헤지)다. 에너지는 단일 종목보다 8개 하위 섹터(석탄·석유·비료·가스·장비·조선·해운·시추)에 폭넓게 분산 노출하는 것이 핵심. 종목 픽은 개인 판단."},
      ${"1) 호르무즈 사태·중동 지정학 리스크 지속 → 2) 원유·가스·요소·나프타 등 원재료 동반 강세 → 3) 매크로 인플레이션 압력 + 실물 경기 둔화 (스태그플레이션 우려) → 4) 반도체·자동차 등 제조업 원재료 수급 차질 가능성 (공장 가동 중단 리스크) → 5) 위험자산 변동성 확대·레버리지 포지션 청산 압력 → 6) 인플레이션·공급충격 헤지 수요로 에너지 섹터 자금 유입 → 7) 8개 하위 섹터(석탄·석유·비료·가스·장비·조선·해운·시추) 전반 강세 사이클 → 8) 에너지 인플레이션 → 식량(비료·곡물)까지 파급 → 9) 사태 진정 시점에는 차익실현 + 사이클 종목으로 자금 이동"},
      ${"단기(1-3개월): 사태 변동성 확대. 레버리지 청산·반대매매 잇따를 가능성. 에너지 8개 섹터 분할 매수 적기. 중기(3-6개월): 에너지 섹터 전반 강세 본격화. 인플레이션 헤지 자금 유입 가속. 한국 매크로 호조주(반도체·방산·조선)는 보유하되 레버리지 없이 운영. 장기(6-12개월): 사태 진정 시점 가까워지면 에너지 차익실현 + 매크로 호조주 비중 확대 전환. 핵심은 사이클 전환 신호 모니터링."},
      ${JSON.stringify([
        "호르무즈 사태 조기 종결로 에너지 가격 빠른 정상화 → 에너지 섹터 차익실현 압력",
        "글로벌 경기 침체 심화로 에너지 수요 자체 감소 (수요 충격이 공급 충격을 앞지를 가능성)",
        "미국 셰일·OPEC+ 증산으로 에너지 공급 과잉 재현",
        "레버리지 축소 후 시장 V자 반등 시 기회비용",
        "에너지 8개 하위 섹터 내 종목 선택 어려움 (분산이 정답이나 종목 픽은 개인 영역)",
        "반대로 인플레이션이 빠르게 진정되면 에너지 비중 확대가 역효과",
        "에너지 섹터 ETF 추종 시 일부 좀비기업·약체 종목 동반 보유 리스크"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "금융", description: "레버리지 포지션 청산 사이클. 한국 신용잔고·미수거래 축소, 반대매매 증가. 단기 변동성 확대 + 우량주 일시 급락 매수 기회 발생.", magnitude: "상" },
    { order: 2, category: "산업", description: "에너지 8개 하위 섹터 전반 강세. 분산 효과 + 인플레이션 헤지로 자금 유입. 사이클 후반까지 모멘텀 지속 가능.", magnitude: "상" },
    { order: 3, category: "산업", description: "석탄·석유·천연가스 현물가격 강세. E&P·정유·중장비 동반 수혜. 미국·호주·중동 에너지 메이저 매출 확대.", magnitude: "상" },
    { order: 4, category: "산업", description: "시추 사이클 회복. Patterson-UTI·Helmerich & Payne·Transocean 가동률·일일 단가 상승. 한국 강관(세아제강·휴스틸·넥스틸) 동반 수혜 (앞 OCTG 아이디어 연동).", magnitude: "상" },
    { order: 5, category: "산업", description: "비료·요소 가격 급등 지속 (앞 요소비료 아이디어 연동). CF Industries·Nutrien·롯데정밀화학 등 직접 수혜.", magnitude: "상" },
    { order: 6, category: "산업", description: "조선·해운 운임 강세. LNG선·VLCC·벌크선 동반 호조. HD한국조선해양·삼성중공업·HMM·팬오션 다중 모멘텀.", magnitude: "상" },
    { order: 7, category: "산업", description: "해양 장비·서비스 사이클 회복. TechnipFMC·Baker Hughes·SLB 심해 시추 장비 발주 모멘텀 (앞 deepwater 아이디어 연동).", magnitude: "중" },
    { order: 8, category: "산업", description: "반도체 등 제조업 일부 공장 가동 차질 우려. 원재료(나프타·고순도 화학물질·요소수) 수급 모니터링 필수. 반도체·자동차 약체 종목 단기 부담.", magnitude: "중" },
    { order: 9, category: "금융", description: "인플레이션 헤지 ETF 자금 유입. XLE(에너지)·MOO(농업)·DBC(원자재) 등 거래대금 급증. 글로벌 자산배분에서 에너지 비중 확대.", magnitude: "중" },
    { order: 10, category: "금융", description: "안전자산 동시 강세. 금(GLD)·달러(DXY)·미국채(TLT) 동시 매수세. 위험자산-안전자산 동시 강세의 흐름.", magnitude: "중" },
    { order: 11, category: "산업", description: "신재생·친환경 일부 자금 유입. 에너지 안보 차원의 분산 투자 — 태양광·풍력·원전(SMR) ETF 동반 강세 가능.", magnitude: "하" },
    { order: 12, category: "정책", description: "각국 정부 에너지 안보 정책 강화. 석유·가스·우라늄·요소 등 핵심 자원 비축 확대.", magnitude: "중" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3: 8개 하위 섹터별 분산 종목 ──
  const companies = [
    // ── ① 석탄 ──
    { name: "Peabody Energy", ticker: "BTU", exchange: "NYSE", sector: "석탄", reason: "[석탄] 미국 최대 석탄 생산자. 호주·미국 광산. 에너지 인플레이션 사이클의 직접 수혜 (앞 석탄·LNG 아이디어 연동).", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Arch Resources", ticker: "ARCH", exchange: "NYSE", sector: "석탄", reason: "[석탄] 미국 원료탄(Met coal) 강자. 철강 수요와도 연동. 에너지+소재 동시 노출.", benefit_type: "직접수혜", confidence: "보통" },

    // ── ② 석유 (E&P/메이저) ──
    { name: "ExxonMobil", ticker: "XOM", exchange: "NYSE", sector: "통합 에너지", reason: "[석유] 글로벌 통합 에너지 메이저. E&P+정제+화학 통합. 유가 강세 사이클의 가장 안정적 노출.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "ConocoPhillips", ticker: "COP", exchange: "NYSE", sector: "셰일 E&P", reason: "[석유] 미국 셰일 E&P 메이저. 자본 규율 + 주주환원. 유가 강세 사이클의 핵심 종목.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Chevron", ticker: "CVX", exchange: "NYSE", sector: "통합 에너지", reason: "[석유] 통합 에너지 메이저 + CPChem(ECC 화학) 50% 지분. 안정적 배당 + 사이클 노출.", benefit_type: "직접수혜", confidence: "높음" },

    // ── ③ 비료 ──
    { name: "CF Industries", ticker: "CF", exchange: "NYSE", sector: "비료", reason: "[비료] 북미 최대 질소비료(요소·암모니아) 생산자. 셰일가스 기반 저원가. 요소 가격 급등 직접 수혜 (앞 요소비료 아이디어 연동).", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Nutrien", ticker: "NTR", exchange: "NYSE", sector: "비료", reason: "[비료] 세계 최대 종합 비료. 질소·인광·칼리 통합 노출. 식량 인플레이션 헤지.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "롯데정밀화학", ticker: "004000.KS", exchange: "KRX", sector: "정밀화학", reason: "[비료/요소수] 한국 요소수(유록스) 메이저. 2021 요소수 사태 재현 시 단기 모멘텀 가장 강함.", benefit_type: "직접수혜", confidence: "높음" },

    // ── ④ 가스 (셰일·LNG) ──
    { name: "EQT Corporation", ticker: "EQT", exchange: "NYSE", sector: "셰일가스 E&P", reason: "[가스] 미국 최대 천연가스 생산자. LNG 수출·비료 원료·발전 수요 다중 노출. 가스 사이클 핵심.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Cheniere Energy", ticker: "LNG", exchange: "NYSE", sector: "LNG 수출", reason: "[가스/LNG] 미국 최대 LNG 수출 업체. 글로벌 LNG 수입 다변화의 최대 수혜 (앞 LNG 인프라 아이디어 연동).", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Range Resources", ticker: "RRC", exchange: "NYSE", sector: "셰일가스 E&P", reason: "[가스] 마셀러스 셰일 가스·NGL 생산자. 에탄 비중 높아 ECC + 비료 수요까지 노출.", benefit_type: "직접수혜", confidence: "보통" },

    // ── ⑤ 장비 (해양·시추 장비) ──
    { name: "TechnipFMC", ticker: "FTI", exchange: "NYSE", sector: "해양 장비", reason: "[장비] 세계 최대 subsea 장비. 심해 시추 + LNG 인프라 노출. 사이클 회복의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Baker Hughes", ticker: "BKR", exchange: "NYSE", sector: "유전 서비스", reason: "[장비] 글로벌 3대 유전 서비스. 시추 + LNG 장비 통합. 사이클 회복 다중 노출.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "SLB (Schlumberger)", ticker: "SLB", exchange: "NYSE", sector: "유전 서비스", reason: "[장비] 세계 최대 유전 서비스. 심해 시추·디지털 솔루션 선도. 글로벌 E&P CAPEX 확대 핵심 수혜.", benefit_type: "직접수혜", confidence: "높음" },

    // ── ⑥ 조선 (한국) ──
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "[조선] LNG선·FLNG·해양플랜트 슈퍼사이클의 핵심. 한국 매크로 호조 + 에너지 사이클 동시 노출.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "[조선] LNG선·FLNG 강자. 서아프리카 FLNG 발주 본격화 시 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "[조선] LNG선·VLEC·잠수함 + 방산 다중 노출. 매크로 + 에너지 + 방산 트리플 노출.", benefit_type: "직접수혜", confidence: "높음" },

    // ── ⑦ 해운 ──
    { name: "Star Bulk Carriers", ticker: "SBLK", exchange: "NASDAQ", sector: "벌크 해운", reason: "[해운] 글로벌 드라이벌크 메이저. 석탄·철광석 운송 수요 증가의 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "HMM", ticker: "011200.KS", exchange: "KRX", sector: "컨테이너·벌크 해운", reason: "[해운] 한국 최대 해운사. 벙커유 가격 변동성 vs 운임 강세의 양면. 에너지 사이클 회복 시 운임 강세 수혜.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "팬오션", ticker: "028670.KS", exchange: "KRX", sector: "벌크 해운", reason: "[해운] 한국 대표 벌크 해운. 석탄·곡물·철광석 운송 수요 동반 증가의 직접 수혜.", benefit_type: "직접수혜", confidence: "보통" },

    // ── ⑧ 시추 (Drilling) ──
    { name: "Transocean", ticker: "RIG", exchange: "NYSE", sector: "심해 시추", reason: "[시추] 세계 최대 심해 시추선(드릴십) 보유. 시추 사이클 회복기에 일일 용선료 상승의 핵심 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Patterson-UTI Energy", ticker: "PTEN", exchange: "NASDAQ", sector: "육상 시추", reason: "[시추] 미국 육상 시추 1위급. 시추기 수 회복 사이클의 직접 수혜 (앞 강관 OCTG 아이디어 연동).", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Helmerich & Payne", ticker: "HP", exchange: "NYSE", sector: "육상 시추", reason: "[시추] 미국 셰일 시추 1위급. Super-Spec rig 보유. 시추 활동 회복의 가장 직접적 수혜.", benefit_type: "직접수혜", confidence: "높음" },

    // ── 한국 강관 (시추 사이클 동행) ──
    { name: "세아제강", ticker: "306200.KS", exchange: "KRX", sector: "강관", reason: "[시추 동행] 한국 OCTG 수출 대장주. 미국 시추 활동 회복 사이클의 한국측 핵심 노출 (앞 OCTG 아이디어 연동).", benefit_type: "직접수혜", confidence: "높음" },
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
    { name: "에너지 비중 확대", category: "테마" },
    { name: "레버리지 축소", category: "테마" },
    { name: "현금 비중", category: "테마" },
    { name: "리스크 관리", category: "테마" },
    { name: "분산 투자", category: "테마" },
    { name: "인플레이션 헤지", category: "테마" },
    { name: "스태그플레이션", category: "테마" },
    { name: "공급 충격", category: "테마" },
    { name: "원재료 수급", category: "테마" },
    { name: "공장 가동 중단", category: "테마" },
    { name: "포트폴리오 전략", category: "테마" },
    { name: "석탄", category: "섹터" },
    { name: "석유", category: "섹터" },
    { name: "비료", category: "섹터" },
    { name: "천연가스", category: "테마" },
    { name: "LNG", category: "섹터" },
    { name: "유전 서비스", category: "섹터" },
    { name: "해양 장비", category: "섹터" },
    { name: "조선", category: "섹터" },
    { name: "해운", category: "섹터" },
    { name: "벌크 해운", category: "섹터" },
    { name: "심해 시추", category: "섹터" },
    { name: "육상 시추", category: "섹터" },
    { name: "강관", category: "테마" },
    { name: "OCTG", category: "테마" },
    { name: "셰일 E&P", category: "섹터" },
    { name: "셰일가스 E&P", category: "섹터" },
    { name: "통합 에너지", category: "섹터" },
    { name: "요소", category: "테마" },
    { name: "호르무즈", category: "테마" },
    { name: "나프타 대란", category: "테마" },
    { name: "안전자산", category: "테마" },
    { name: "에너지 안보", category: "테마" },
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

insertEnergyOverweight().catch(console.error);
