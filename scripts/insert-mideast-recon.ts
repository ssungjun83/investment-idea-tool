import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function insertMideastRecon() {
  // ── 1. 아이디어 저장 ──
  const rawInput = `승도리의 뉴스클리핑 2026년 2분기 (4/13-7/10):
아시아쪽 에너지 기업은 관심 없음.
이 사태(중동 분쟁)가 끝나고 나면:
1. 중동 인프라 재건 (이미 건설주는 아주 낙관적인 미래를 땡기고 있는데 전쟁이 유지되면 이거 롤백될수도 있으니 주의)
2. 에너지 공급망 다변화 (특히 지정학적으로 문제없는 해양 & 미국 & 남미 & 서아프리카쪽)
3. LNG 공급망 다변화 (카타르 대체를 할만한곳이 미국 호주말곤 없음...) (LNG 기자재 및 인프라)
4. 거기에서 파생되는 해운회사들 톤 마일 증가 (해운)
5. 이어지는 한국 중국의 VLCC 수주 (조선)`;

  const title = "중동 사태 종식 이후 — 인프라 재건·에너지 공급망 다변화·LNG·해운·조선";

  const [idea] = await sql`
    INSERT INTO ideas (raw_input, title) VALUES (${rawInput}, ${title}) RETURNING id
  `;
  const ideaId = idea.id as number;
  console.log(`✅ idea inserted: id=${ideaId}`);

  // ── 2. Stage 1 ──
  await sql`
    INSERT INTO stage1_idea (idea_id, theme, background, mechanism, timeline, risk_factors)
    VALUES (
      ${ideaId},
      ${"중동 분쟁 종식 이후 5대 수혜 테마 — 인프라 재건·에너지 공급망 다변화·LNG·해운·조선"},
      ${"중동 분쟁이 장기화되면서 에너지 공급망의 지정학적 취약성이 부각됐다. 호르무즈 해협·카타르 의존도가 높은 LNG 공급 구조를 다변화하려는 움직임이 강해지고 있으며, 분쟁 종식 시 중동 인프라 재건 수요와 함께 지정학 리스크가 없는 미국·남미·서아프리카 중심의 에너지 개발 가속화가 예상된다. 이에 따른 해운 톤마일 증가와 VLCC·LNG선 발주 확대는 한국 조선사의 수주 모멘텀으로 직결된다. 단, 건설주(인프라 재건)는 전쟁 지속 시 기대가 롤백될 수 있어 주의가 필요하다."},
      ${"1) 중동 분쟁 종식/완화 → 2) 중동 인프라 재건 수요 본격화 (건설·플랜트) → 3) 에너지 공급망 다변화 가속 (미국·남미·서아프리카 deepwater 개발) → 4) LNG 공급망 다변화 (카타르 대체 → 미국·호주 LNG 수출 확대) → 5) LNG 기자재·터미널 인프라 투자 증가 → 6) 장거리 에너지 운송 확대 → 해운 톤마일 증가 → 7) VLCC·LNG선 신규 발주 → 한국 조선사 수주 확대"},
      ${"단기(1-3개월): 분쟁 완화 신호 포착 시 선제적 포지션 구축 필요. 건설주 모멘텀 지속 여부 확인. 중기(3-6개월): LNG 터미널·공급 계약 발표로 수혜 기업 확인. 해운 운임·톤마일 지표 개선 반영. 장기(6-12개월): VLCC·LNG선 발주 계약 가시화. 한국 조선사 백로그 확대. 미국·호주 LNG 수출 인프라 착공."},
      ${JSON.stringify([
        "분쟁 장기화 시 인프라 재건 기대 롤백 — 건설주 특히 주의",
        "중동 산유국 에너지 패권 유지 시 공급망 다변화 동력 약화",
        "미국 LNG 수출 규제·허가 지연 가능성",
        "중국 조선사 경쟁 심화로 한국 수주 단가 압박",
        "글로벌 경기 침체 시 에너지 수요 감소 → 운임·발주 동반 하락",
        "호주 LNG 노사 분규·공급 차질 리스크"
      ])}
    )
  `;
  console.log("✅ stage1 inserted");

  // ── 3. Stage 2 ──
  const effects = [
    { order: 1, category: "산업", description: "중동 인프라 재건 수요 — 도로·항만·에너지 플랜트 복구 발주. 단, 전쟁 지속 시 기대 롤백 위험 존재. 건설·EPC 기업 양면 리스크.", magnitude: "상" },
    { order: 2, category: "산업", description: "에너지 공급망 다변화 — 미국·남미·서아프리카 deepwater 개발 투자 확대. 지정학 리스크 없는 지역 중심으로 E&P·장비 기업 수혜.", magnitude: "상" },
    { order: 3, category: "산업", description: "LNG 공급망 다변화 — 카타르 의존 탈피 목적으로 미국·호주 LNG 수출 인프라 투자 급증. LNG 터미널·기자재·액화설비 수요 폭증.", magnitude: "상" },
    { order: 4, category: "산업", description: "해운 톤마일 증가 — 중동 우회 항로 지속 및 원거리 LNG·원유 운송 확대로 VLCC·LNG선 운임 상승 및 가동률 개선.", magnitude: "중" },
    { order: 5, category: "산업", description: "VLCC·LNG선 신규 발주 — 선복량 부족과 노후선 교체 수요 맞물려 한국 조선 3사 중심 대형 발주 계약 증가.", magnitude: "상" },
    { order: 6, category: "금융", description: "에너지 프로젝트 파이낸싱 확대 — 미국·호주 LNG 및 deepwater 프로젝트 FID(최종투자결정) 잇따라 프로젝트 금융 시장 활성화.", magnitude: "중" },
  ];

  for (const ef of effects) {
    await sql`
      INSERT INTO stage2_effects (idea_id, effect_order, category, description, magnitude)
      VALUES (${ideaId}, ${ef.order}, ${ef.category}, ${ef.description}, ${ef.magnitude})
    `;
  }
  console.log(`✅ stage2 inserted: ${effects.length}개`);

  // ── 4. Stage 3 (NYSE/NASDAQ/KRX만) ──
  const companies = [
    // LNG 인프라·수출 (직접수혜)
    { name: "Cheniere Energy", ticker: "LNG", exchange: "NYSE", sector: "LNG", reason: "미국 최대 LNG 수출 터미널 운영사(Sabine Pass, Corpus Christi). 카타르 대체 LNG 공급원으로 유럽·아시아 장기계약 급증. 미국 LNG 다변화 핵심 수혜주.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "New Fortress Energy", ticker: "NFE", exchange: "NASDAQ", sector: "LNG", reason: "부유식 LNG 터미널·공급 인프라 전문 기업. 빠른 인프라 구축이 강점으로 중동 대체 LNG 공급망 확대 시 직접 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Baker Hughes", ticker: "BKR", exchange: "NASDAQ", sector: "LNG 기자재", reason: "LNG 액화 압축기·터빈 등 핵심 기자재 세계 1위 공급사. LNG 터미널 신규 건설 및 확장 프로젝트 증가로 수주 폭증 기대.", benefit_type: "직접수혜", confidence: "높음" },
    // 에너지 공급망 다변화 (deepwater)
    { name: "TechnipFMC", ticker: "FTI", exchange: "NYSE", sector: "해양 장비", reason: "미국·남미·서아프리카 deepwater 개발 확대 시 subsea 장비 수주 직접 수혜. 중동 의존 탈피로 해당 지역 프로젝트 FID 가속.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "SLB (Schlumberger)", ticker: "SLB", exchange: "NYSE", sector: "유전 서비스", reason: "에너지 공급망 다변화 대상 지역(미국·남미·서아프리카) 전 영역에서 시추·기술 서비스 제공. 글로벌 최대 유전 서비스 기업.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "Transocean", ticker: "RIG", exchange: "NYSE", sector: "심해 시추", reason: "서아프리카·남미 deepwater 시추 수요 증가로 드릴십 용선료·가동률 동반 상승 기대.", benefit_type: "직접수혜", confidence: "높음" },
    // 해운 (톤마일 증가)
    { name: "Frontline", ticker: "FRO", exchange: "NYSE", sector: "VLCC 해운", reason: "세계 최대 VLCC(초대형 원유운반선) 운영사. 중동 우회 장거리 항로 확대로 톤마일 증가, 운임 강세 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "International Seaways", ticker: "INSW", exchange: "NYSE", sector: "VLCC 해운", reason: "VLCC·아프라막스 탱커 운영. 중동발 지정학 리스크 완화 이후 원거리 원유 운송 수요 증가로 수혜.", benefit_type: "직접수혜", confidence: "보통" },
    { name: "팬오션", ticker: "028670.KS", exchange: "KRX", sector: "벌크·에너지 해운", reason: "벌크·탱커·LNG 운반선 운영. 에너지 공급망 다변화에 따른 장거리 운송 증가로 톤마일 수혜.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "HMM", ticker: "011200.KS", exchange: "KRX", sector: "해운", reason: "컨테이너·벌크 해운사. 중동 우회 항로 정상화 이후 항로 최적화 효과. 에너지 물동량 증가 간접 수혜.", benefit_type: "간접수혜", confidence: "보통" },
    // 조선 (VLCC·LNG선 발주)
    { name: "HD한국조선해양", ticker: "009540.KS", exchange: "KRX", sector: "조선", reason: "VLCC·LNG선 세계 최고 건조 경쟁력. 중동 에너지 운송 재편 및 LNG 공급망 확대에 따른 대형 선박 발주 최대 수혜.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "삼성중공업", ticker: "010140.KS", exchange: "KRX", sector: "조선", reason: "LNG선·드릴십 건조 세계 정상급. LNG 공급망 다변화로 LNG선 발주 급증 시 직접 수혜. FLNG(부유식 LNG) 건조 역량도 보유.", benefit_type: "직접수혜", confidence: "높음" },
    { name: "한화오션", ticker: "042660.KS", exchange: "KRX", sector: "조선", reason: "VLCC·LNG선·FPSO 건조 역량. 조선 슈퍼사이클 도래 시 수주 확대 기대.", benefit_type: "직접수혜", confidence: "보통" },
    // 건설 (주의 — 롤백 리스크)
    { name: "현대건설", ticker: "000720.KS", exchange: "KRX", sector: "건설·플랜트", reason: "중동 플랜트·인프라 재건 수혜 기대. 단, 전쟁 지속 시 기대가 롤백될 수 있어 주의 필요. 중동 수주 비중 높음.", benefit_type: "간접수혜", confidence: "보통" },
    { name: "삼성엔지니어링", ticker: "028050.KS", exchange: "KRX", sector: "건설·플랜트", reason: "중동 EPC 플랜트 전문. 분쟁 종식 시 재건 수혜 기대. 단, 분쟁 장기화 시 수주 기대 조정 리스크.", benefit_type: "간접수혜", confidence: "보통" },
  ];

  for (const co of companies) {
    await sql`
      INSERT INTO stage3_companies (idea_id, company_name, ticker, exchange, sector, reason, benefit_type, confidence)
      VALUES (${ideaId}, ${co.name}, ${co.ticker}, ${co.exchange}, ${co.sector}, ${co.reason}, ${co.benefit_type}, ${co.confidence})
    `;
  }
  console.log(`✅ stage3 inserted: ${companies.length}개`);

  // ── 5. 키워드 ──
  const kwList = [
    { name: "중동 분쟁", category: "테마" },
    { name: "인프라 재건", category: "테마" },
    { name: "에너지 공급망 다변화", category: "테마" },
    { name: "LNG", category: "섹터" },
    { name: "LNG 기자재", category: "섹터" },
    { name: "VLCC", category: "테마" },
    { name: "조선", category: "섹터" },
    { name: "해운", category: "섹터" },
    { name: "톤마일", category: "테마" },
    { name: "심해 시추", category: "테마" },
    { name: "Deepwater", category: "테마" },
    { name: "서아프리카", category: "지역" },
    { name: "남미", category: "지역" },
    { name: "미국", category: "지역" },
    { name: "호주", category: "지역" },
    { name: "한국", category: "지역" },
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

  // ── 6. 키워드 관계 ──
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

insertMideastRecon().catch(console.error);
