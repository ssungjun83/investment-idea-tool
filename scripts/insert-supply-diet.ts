import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertSupplyDiet() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):
[전달된 채널: 급등일보 미국주식 속보·리서치]

FT 보도에 따르면, 루프트한자는 이란 분쟁으로 인해 제트 연료 가격이 두 배로 급등함에 따라
연료 절약을 위해 5월부터 10월까지 약 2만 편의 단거리 항공편을 취소하여 하루 약 120편의 항공편을 줄일 예정입니다.

[원문] LUFTHANSA WILL CANCEL AROUND 20,000 SHORT-HAUL FLIGHTS BETWEEN MAY AND OCTOBER, CUTTING ROUGHLY 120 DAILY FLIGHTS - First Squawk on X.

(승도리 코멘트) 이 사태가 끝나면 봐야될 섹터:
- 한국 화학사
- 한국 항공사
→ 여긴 구조조정 빡세게해서 공급 엄청나게 다이어트 될 가능성이 큼`;

  const title = "호르무즈 사태 이후 공급 다이어트 — 한국 화학·항공 구조조정 턴어라운드 베팅";

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
      ${"호르무즈 사태로 강제 구조조정 진행 중인 한국 화학·항공 — 사태 종료 후 공급 다이어트로 V자 턴어라운드 베팅 (컨트라리안)"},
      ${"이란 분쟁(호르무즈 봉쇄)로 제트유 가격이 두 배로 급등하자 루프트한자가 2026년 5~10월 약 2만 편(하루 120편)의 단거리 항공편 취소를 발표했다. 한국의 NCC 기반 화학사들도 나프타 부족·에틸렌-나프타 스프레드 악화로 가동률이 강제 압박받고 있고, 한국 항공사들도 연료비 부담으로 노선 축소·기재 매각 압박을 받고 있다. 이는 글로벌 항공·화학 산업이 동시에 강제 구조조정 사이클에 진입했음을 의미한다. 본 아이디어는 사태가 한창 진행 중인 현재가 아니라 '사태가 끝나는 시점' 또는 종료 신호 직전을 노린 컨트라리안 베팅이다. 살아남은 기업은 다이어트된 공급 + 회복되는 수요의 더블 레버리지로 V자 실적 회복 + 멀티플 리레이팅을 동시에 누릴 가능성이 크다."},
      ${"1) 호르무즈 사태로 원유·나프타·제트유 가격 급등 → 2) 한국 NCC 화학사 가동률 강제 축소·노후 설비 가동 중단·매각 → 3) 한국 항공사 노선 축소·기재 매각·인력 구조조정 → 4) 글로벌 항공사(루프트한자 등) 동조 노선 축소 → 5) 산업 전반의 공급능력 영구적 감소 (= 공급 다이어트) → 6) 사태 종료·정상화 시점 도래 → 7) 다이어트된 공급 vs 회복되는 수요의 미스매치 → 8) 살아남은 기업의 가동률·운임·마진 동시 정상화 → 9) 점유율 확대 + 가격 결정력 회복 → 10) 실적 V자 회복 + 멀티플 리레이팅 동시 진행"},
      ${"단기(1-3개월): 사태 진행 중 - 한국 화학·항공사 분기 적자 확대 + 주가 추가 하락 가능. 매수 분할 진입 시작 단계로 인내 필요. 중기(3-6개월): 노후 NCC 가동 중단·항공사 노선 영구 축소·M&A 등 구조조정 본격화. 신용등급 하향이 바닥 신호일 수 있음. 장기(6-12개월): 사태 진정 신호 가시화되면 살아남은 기업 위주 주가 선행 반등. 12-18개월 후 V자 실적 회복 + 멀티플 리레이팅 본격화."},
      ${JSON.stringify([
        "호르무즈 사태 장기화 시 살아남는 기업조차 재무 한계 도달·유상증자 희석 리스크",
        "사태 종료 시점 식별 어려움 — 너무 일찍 진입 시 추가 하락 견뎌야 함",
        "중국 NCC·저비용항공의 공급 다이어트는 한국보다 더딜 가능성 → 회복기에 중국 점유율 확대로 한국 수혜 제한",
        "글로벌 경기 침체 심화 시 공급 다이어트보다 수요 둔화가 더 빠르게 진행",
        "한국 정부의 산업 지원·구제금융으로 구조조정 강도가 약화될 가능성 (좀비기업 잔존)",
        "화학·항공 양 섹터 동시 악화로 회사채·자금조달 환경 경색",
        "에너지 전환 가속으로 화학·항공 장기 수요 구조 변화 (특히 화학)"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2: 사이드이펙트 ──
  const effects = [
    { order: 1, category: "산업", description: "한국 NCC 화학사 가동률 강제 축소. 노후 설비 가동 중단·매각·합작 가속. 산업 전체 캐파 영구 감소로 사태 종료 시 살아남은 기업의 수급·마진 회복 폭 확대.", magnitude: "상" },
    { order: 2, category: "산업", description: "한국 항공사 노선 축소·기재 매각·인력 구조조정. 공급 다이어트가 진행되면서 사태 종료 후 운임 결정력 회복 + 영업이익률 V자 반등 가능.", magnitude: "상" },
    { order: 3, category: "산업", description: "살아남은 화학·항공 기업의 시장 점유율 확대. 약체 경쟁사 퇴출·축소로 가격 결정력 회복 + 멀티플 리레이팅 동시 진행.", magnitude: "상" },
    { order: 4, category: "금융", description: "한국 화학·항공사 신용등급 추가 하향 압력. 회사채 스프레드 확대 + 자금조달 환경 경색. 신용등급 바닥 신호가 주가 매수 트리거 역할 가능.", magnitude: "상" },
    { order: 5, category: "산업", description: "글로벌 항공사(Lufthansa·Air France-KLM·IAG) 노선 축소 동조화. 글로벌 항공 공급 동시 다이어트로 사태 종료 후 글로벌 운임 사이클 회복.", magnitude: "중" },
    { order: 6, category: "산업", description: "M&A·합병 사례 증가. 약체 화학·항공사를 중심으로 인수합병·구조조정 활발. 살아남은 기업의 인수 기회.", magnitude: "중" },
    { order: 7, category: "산업", description: "항공기 리스사·기재 시장 변동. 단거리 협동체 기재 일시 공급 과잉 → 리스료 하락 → 향후 신규 발주 위축. 보잉·에어버스 인도 일정 영향.", magnitude: "중" },
    { order: 8, category: "산업", description: "항공유 정제 마진 변동성 확대. 제트유 수급 타이트 + 가격 급등으로 정유사(SK이노·S-OIL·GS칼텍스) 일부 부문 단기 수혜. 다만 항공 수요 위축은 양면성.", magnitude: "중" },
    { order: 9, category: "정책", description: "정부 산업 지원·구조조정 정책 가능성. 한국 정부의 화학·항공 지원 패키지(저리 대출·세제 혜택) 발표 시 단기 주가 모멘텀.", magnitude: "중" },
    { order: 10, category: "산업", description: "공항 운영사·여행 관련 산업 동반 부진. 인천공항·여행사·면세점 단기 실적 악화. 사태 종료 시 후행 회복.", magnitude: "하" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3: 수혜 기업 (턴어라운드 후보) ──
  const companies = [
    // ── 한국 화학 (구조조정 후 턴어라운드 — 핵심 베팅) ──
    { name: "LG화학", ticker: "051910.KS", exchange: "KRX", sector: "석유화학", reason: "한국 최대 NCC 보유. 사태 진행 중에는 화학 부문 적자 확대로 직격탄이지만, 배터리 소재 사업이 하방 지지. 산업 전반 공급 다이어트 후 살아남는 1순위 — 점유율 확대 + 마진 회복의 더블 레버리지. 신용등급·주가 바닥에서 분할 매수 후보.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "롯데케미칼", ticker: "011170.KS", exchange: "KRX", sector: "석유화학", reason: "여수·대산 NCC 기반의 순수 석유화학 업체. 사태 진행 중 가장 큰 피해 + 신용등급 하향 압력. 그러나 사업이 단순한 만큼 사태 종료 후 NCC 마진 정상화 시 가장 가파른 V자 회복. 사이클 베타가 가장 큼.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "금호석유화학", ticker: "011780.KS", exchange: "KRX", sector: "석유화학", reason: "여수 NCC + 합성고무·페놀 통합. 자동차·타이어 수요 회복과 동조하는 합성고무 부문이 추가 회복 트리거. 자사주 정책 등 주주환원 여력도 보유.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "한화솔루션", ticker: "009830.KS", exchange: "KRX", sector: "석유화학", reason: "케미칼 + 신재생(태양광) 결합. 사태 진행 중에는 화학 부문이 부담이지만 신재생 부문이 일부 상쇄. 사태 종료 후 PVC·가성소다 강세 사이클 진입 시 케미칼 부문 V자 회복.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "대한유화", ticker: "006650.KS", exchange: "KRX", sector: "석유화학", reason: "올레핀·폴리올레핀 전문 NCC. 사태 진행 중 마진 압박 직격탄 → 사태 종료 시 가장 가파른 회복 후보. 소형주 특성상 주가 변동성 큼 — 고위험 고수익.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 항공 (구조조정 후 턴어라운드) ──
    { name: "대한항공", ticker: "003490.KS", exchange: "KRX", sector: "항공", reason: "한국 최대 항공사 + 아시아나 합병. 사태 진행 중 연료비 직격탄이지만 합병 시너지 + 화물 사업이 하방 지지. 사태 종료 시 운임 정상화 + 합병 효과의 더블 레버리지. 항공 섹터 1순위 회복 종목.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "제주항공", ticker: "089590.KS", exchange: "KRX", sector: "항공", reason: "한국 최대 LCC. 단거리 노선 비중 높아 사태 진행 중 직격탄. 그러나 LCC 시장 구조조정 진행 시 살아남는 1순위. 사태 종료 후 운임 정상화의 베타가 가장 큰 LCC.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "티웨이항공", ticker: "091810.KS", exchange: "KRX", sector: "항공", reason: "장거리 노선 확장 중인 LCC. 사태 진행 중 재무 부담 크지만, 살아남으면 장거리 LCC 포지션 강화. 고위험 고수익 턴어라운드.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "진에어", ticker: "272450.KS", exchange: "KRX", sector: "항공", reason: "대한항공 그룹 LCC. 통합 LCC 출범 가능성으로 한국 LCC 시장 재편의 핵심 변수. 그룹 차원 지원으로 생존 가능성 높음.", benefit_type: "직접수혜", confidence: "보통" },

    // ── 한국 정유 (제트유 가격 강세 단기 수혜) ──
    { name: "S-Oil", ticker: "010950.KS", exchange: "KRX", sector: "정유", reason: "제트유 가격 급등 시 정유 마진 일부 수혜. 다만 항공 수요 위축은 양면성. 사태 진행 구간에서 가장 안정적 모니터링 종목.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 글로벌 항공 (동일 논리 적용) ──
    { name: "Delta Air Lines", ticker: "DAL", exchange: "NYSE", sector: "항공", reason: "미국 메이저 항공사. 글로벌 항공 공급 다이어트 시 가장 안정적 회복 후보. 프리미엄 좌석 비중 높아 운임 회복의 직접 수혜.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "United Airlines", ticker: "UAL", exchange: "NASDAQ", sector: "항공", reason: "미국 글로벌 노선 강자. 사태 종료 후 국제선 회복의 직접 수혜. 미국 항공 섹터 회복 사이클의 베타가 큰 종목.", benefit_type: "간접수혜", confidence: "보통" },

    // ── 글로벌 화학 (동일 논리) ──
    { name: "Dow Inc.", ticker: "DOW", exchange: "NYSE", sector: "석유화학", reason: "글로벌 화학 사이클 회복기에 가장 안정적 회복 후보. 사태 진행 중에는 ECC 기반으로 한국 NCC 대비 우월하나, 사태 종료 후 산업 전반 회복기에는 모두 상승. 분산 차원의 페어 포지션.", benefit_type: "간접수혜", confidence: "보통" },
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
    { name: "구조조정", category: "테마" },
    { name: "공급 다이어트", category: "테마" },
    { name: "턴어라운드", category: "테마" },
    { name: "컨트라리안 투자", category: "테마" },
    { name: "V자 회복", category: "테마" },
    { name: "멀티플 리레이팅", category: "테마" },
    { name: "호르무즈", category: "테마" },
    { name: "호르무즈 봉쇄", category: "테마" },
    { name: "미-이란 전쟁", category: "테마" },
    { name: "제트유", category: "테마" },
    { name: "항공유", category: "테마" },
    { name: "연료비", category: "테마" },
    { name: "항공", category: "섹터" },
    { name: "LCC", category: "섹터" },
    { name: "석유화학", category: "섹터" },
    { name: "NCC", category: "기술" },
    { name: "에틸렌", category: "테마" },
    { name: "나프타", category: "테마" },
    { name: "정유", category: "섹터" },
    { name: "신용등급", category: "테마" },
    { name: "M&A", category: "테마" },
    { name: "한국", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "유럽", category: "지역" },
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

insertSupplyDiet().catch(console.error);
