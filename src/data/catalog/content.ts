import type {
  CatalogDocument,
  ModelSpecification,
  TestResult,
} from "@/data/catalog/types";

export const marketItems = [
  {
    id: "export",
    title: "수출 대응",
    description:
      "목재 포장재에 적용되는 처리요건과 목적국 규정을 확인해야 합니다. 압축성형 목재 팔레트는 제품 구성과 제조 방식에 따라 ISPM 15 적용 제외 가능성을 검토할 수 있지만, 최종 적용 여부는 목적국 규정과 제품 구성 확인 후 판단해야 합니다.",
  },
  {
    id: "storage",
    title: "보관 효율",
    description:
      "중첩 가능한 제품군은 미사용 팔레트를 겹쳐 보관할 수 있습니다. 실제 적층수량과 절감 가능한 공간은 제품 모델, 창고 높이, 적재장비와 보관조건에 따라 달라집니다.",
  },
  {
    id: "transport",
    title: "운송 효율",
    description:
      "팔레트 자체의 부피와 중량, 컨테이너 적재수량, 회수와 보관 방식은 전체 운송비에 영향을 줍니다. 제품 가격과 함께 전체 운송조건을 검토해야 합니다.",
  },
  {
    id: "resources",
    title: "자원 활용",
    description:
      "목재 부산물과 농림업 부산물을 원료로 활용하는 제조 방식은 새 원목 사용을 줄이고 자원의 재활용 범위를 넓히는 방향을 제시합니다.",
  },
  {
    id: "equipment",
    title: "설비 적합성",
    description:
      "랙 구조, 지게차 포크 방향, 자동화 이송설비, 컨베이어 롤러 간격과 화물 하중분포를 함께 확인해야 합니다.",
  },
] as const;

export const productOverviewCards = [
  {
    id: "material",
    title: "목질 원료 활용",
    description:
      "농림업 부산물과 목질 원료를 활용하는 제조 방향을 제시합니다. 제품별 원료 구성은 별도 확인이 필요합니다.",
  },
  {
    id: "nesting",
    title: "중첩 보관",
    description:
      "중첩 가능한 제품군은 미사용 팔레트의 보관 부피 절감을 검토할 수 있습니다.",
  },
  {
    id: "nail-free",
    title: "못 없는 구조",
    description:
      "금형 일체형 성형으로 일반 원목 조립식 팔레트처럼 못을 사용하지 않는 구조입니다.",
  },
  {
    id: "operation",
    title: "운용조건 검토",
    description:
      "화물, 랙, 지게차 진입 방향과 자동화 설비 조건을 함께 확인합니다.",
  },
] as const;

export const operationalAdvantages = [
  {
    id: "export-management",
    title: "수출 포장 관리",
    description:
      "접착제, 열과 압력을 이용해 제조된 가공목재 제품입니다. 제품 구성과 목적국 규정에 따라 ISPM 15 적용 제외 가능성을 검토할 수 있습니다.",
  },
  {
    id: "nested-storage",
    title: "중첩 보관",
    description:
      "중첩 가능한 제품군은 미사용 팔레트를 겹쳐 보관할 수 있습니다. 모델별 적층수량은 사양과 보관조건에 따라 달라집니다.",
  },
  {
    id: "integrated",
    title: "못 없는 일체형 구조",
    description:
      "금형에서 일체형으로 성형되어 일반 원목 조립식 팔레트처럼 못을 사용하지 않는 구조입니다.",
  },
  {
    id: "consistent-size",
    title: "균일한 규격",
    description:
      "금형을 이용해 동일 규격으로 성형하는 구조로, 제품별 형상과 치수를 일정하게 관리하는 방향입니다.",
  },
  {
    id: "loads",
    title: "하중 성능",
    description:
      "제품군별 제조사 제시 동하중과 정하중이 다르며, 시험자료는 해당 시험시료의 결과입니다.",
  },
  {
    id: "moisture",
    title: "습기 환경 고려",
    description:
      "흡수 두께팽창률 시험을 통해 시료의 수분 관련 물리성능이 확인되었습니다. 습기와 수분 환경을 고려해 적용조건을 검토합니다.",
  },
  {
    id: "custom",
    title: "맞춤 설계",
    description:
      "화물 크기와 장비 조건에 따라 특수 규격과 구조의 설계 가능성을 상담할 수 있습니다.",
  },
  {
    id: "total-cost",
    title: "전체 물류비 검토",
    description:
      "구매가뿐 아니라 보관, 운송, 처리, 교체주기와 설비 적합성을 함께 검토해야 합니다.",
  },
] as const;

export const generalComparison = [
  {
    id: "structure",
    label: "구조",
    conventional: "목재 부재를 조립해 사용하는 일반적인 구조",
    molded: "금형에서 고온·고압으로 성형한 일체형 구조",
  },
  {
    id: "fastening",
    label: "체결 방식",
    conventional: "못 등 별도 체결재를 사용하는 구조",
    molded: "못을 사용하지 않는 일체형 구조",
  },
  {
    id: "storage",
    label: "보관",
    conventional: "완성된 형태 그대로 적층·보관",
    molded: "중첩 가능한 제품군으로 미사용 보관 부피 절감 검토",
  },
  {
    id: "export",
    label: "수출 관리",
    conventional: "목적국의 목재 포장재 처리요건 확인 필요",
    molded:
      "제품 구성과 목적국 규정에 따라 ISPM 15 적용 제외 가능 여부 검토",
  },
  {
    id: "application",
    label: "적용 판단",
    conventional: "화물과 사용환경에 맞춰 사양 확인",
    molded: "화물·랙·지게차·자동화 설비 조건을 함께 검토",
  },
] as const;

export const manufacturerComparison = [
  {
    id: "container",
    label: "40ft 컨테이너 적재",
    conventional: "약 450개",
    molded: "약 1,650개",
    note: "실제 적재수량은 모델과 포장방식에 따라 달라질 수 있습니다.",
  },
  {
    id: "cost",
    label: "비용",
    conventional: "운영조건별 확인",
    molded: "제조사 제공자료상 20~30% 절감 제시",
    note: "실제 절감률은 구매수량, 운임, 보관과 회수조건에 따라 달라집니다.",
  },
  {
    id: "wood-use",
    label: "목재 활용률",
    conventional: "60% 이하",
    molded: "95% 이상",
    note: "제조사 제공자료 기준",
  },
  {
    id: "load",
    label: "하중",
    conventional: "정하중 1~2톤",
    molded: "계열별 제조사 사양 별도 확인",
    note: "제조사 제시 사양과 제3자 시험값은 구분해 확인해야 합니다.",
  },
  {
    id: "export-treatment",
    label: "수출 처리",
    conventional: "목적국 처리요건 확인 필요",
    molded: "제품 구성에 따른 적용 제외 가능성 검토",
    note: "목적국 규정과 제품 구성 확인 후 판단합니다.",
  },
] as const;

export const productStructureItems = [
  { id: "deck", title: "상판", description: "화물을 지지하는 일체형 상부 구조" },
  { id: "support", title: "받침", description: "지게차 운용과 적재를 고려한 하부 구조" },
  { id: "reinforcement", title: "보강", description: "제품 모델에 따라 설계되는 대각선, X형 또는 리브 보강부" },
  { id: "entry", title: "진입부", description: "포크 진입 높이와 방향을 고려한 하부 개구부" },
  { id: "nesting", title: "중첩부", description: "제품군에 따라 겹쳐 보관할 수 있도록 설계된 구조" },
] as const;

export const manufacturingProcess = [
  { id: "select", title: "원료 선별", description: "원료 상태와 제조 적합성을 확인합니다." },
  { id: "crush", title: "1차 파쇄", description: "성형에 적합한 크기로 원료를 파쇄합니다." },
  { id: "mill", title: "미세 분쇄", description: "균일한 혼합을 위해 입도를 조정합니다." },
  { id: "dry", title: "건조 및 함수율 조정", description: "건조와 함수율 조정을 진행합니다." },
  { id: "mix", title: "MDI계 접착 시스템 혼합", description: "MDI계 접착 시스템을 원료에 균일하게 혼합합니다." },
  { id: "mold", title: "고온·고압 압축성형", description: "금형에서 고온·고압으로 일체형 성형합니다." },
  { id: "inspect", title: "검사 및 출하", description: "제품의 외관, 형상과 기본 상태를 확인한 뒤 출하합니다." },
] as const;

export const physicalTests: TestResult[] = [
  {
    id: "test-2025",
    reportTitle: "2025 물리성능 시험",
    reportNumber: "TJA20251108-0015",
    issuer: "국가포장제품품질검사센터",
    issueDate: "2025.02.21",
    sample: ["압축성형 팔레트", "1100 × 1100 × 130mm", "4개", "생산 배치 ADS20241220", "제품 중량 17.68kg"],
    testPeriod: "2025.02.17–2025.02.20",
    metrics: [
      { id: "fork", name: "포크 인양시험", value: "2,818kg", referenceValue: "≥ 1,800kg", judgement: "적합" },
      { id: "top", name: "상판 집중하중", value: "8,447kg", referenceValue: "≥ 7,000kg", judgement: "적합" },
      { id: "leg", name: "지지다리 압축성능*", value: "2,462kg", referenceValue: "≥ 2,000kg", judgement: "적합", note: "CNAS 인정범위 밖 항목" },
      { id: "density", name: "밀도", value: "1.01g/cm³", referenceValue: "≥ 0.80g/cm³", judgement: "적합" },
      { id: "moisture", name: "함수율", value: "7.5%", referenceValue: "≤ 10%", judgement: "적합" },
      { id: "swelling", name: "흡수 두께팽창률", value: "8.6%", referenceValue: "≤ 15%", judgement: "적합" },
    ],
    limitations: [
      "본 결과는 보고서에 기재된 제출 시료에 한해 적용됩니다.",
      "다른 모델 또는 전체 제품군의 성능으로 확대 적용하지 않습니다.",
      "보고서의 사용 제한과 복제 제한은 원문을 기준으로 확인해야 합니다.",
    ],
    sourceType: "THIRD_PARTY_TEST",
    documentId: "national-2025",
  },
  {
    id: "test-2026",
    reportTitle: "2026 TBK 물리성능 시험",
    reportNumber: "TBK20260318Lab10101-2A",
    issuer: "쑤저우 톈뱌오 시험기술유한회사",
    issuerEn: "Suzhou TBK Testing Technology Co., Ltd.",
    issueDate: "2026.04.02",
    sample: ["압축성형 팔레트", "모델 1100 × 1100", "3개", "시료 접수일 2026.03.18"],
    testPeriod: "2026.03.20–2026.04.01",
    environment: ["온도 20℃", "습도 55%RH"],
    method: "GB/T 17657-2022",
    metrics: [
      { id: "density", name: "밀도", value: "0.95g/cm³", referenceValue: "≥ 0.80g/cm³", judgement: "적합" },
      { id: "moisture", name: "함수율", value: "7.50%", referenceValue: "≤ 10%", judgement: "적합" },
      { id: "swelling", name: "흡수 두께팽창률", value: "13.59%", referenceValue: "≤ 15%", judgement: "적합" },
      { id: "bond", name: "내부결합강도", value: "0.65MPa", referenceValue: "≥ 0.6MPa", judgement: "적합" },
      { id: "fork", name: "포크 인양성능", value: "2,560kg", referenceValue: "≥ 1,800kg", judgement: "적합" },
      { id: "top", name: "상판 집중하중성능", value: "8,220kg", referenceValue: "≥ 7,000kg", judgement: "적합" },
    ],
    limitations: [
      "시험 결과는 제출된 시료에만 적용됩니다.",
      "다른 모델 또는 모든 생산품의 성능으로 확대하지 않습니다.",
      "보고서에는 기업 제품 연구개발과 내부 품질관리를 위한 자료라는 제한이 있습니다.",
    ],
    sourceType: "THIRD_PARTY_TEST",
    documentId: "tbk-2026-physical",
  },
];

export const formaldehydeTest = {
  id: "formaldehyde-2026",
  issuer: "Suzhou TBK Testing Technology Co., Ltd.",
  reportNumber: "TBK20260318Lab10101-1A",
  issueDate: "2026.04.02",
  sample: "압축성형 팔레트 · 1100 × 1100 · 1개",
  testPeriod: "2026.03.23–2026.04.01",
  environment: "온도 21℃ · 습도 57%RH",
  method: "GB/T 17657-2022",
  equipment: "UVmini-1240 UV-Visible Spectrophotometer",
  detectionLimit: "0.1mg/L",
  result: "0.9mg/L",
} as const;

export const carbonFootprint = {
  id: "carbon-footprint",
  issuer: "SGS",
  documentNumber: "CN25/00002415",
  model: "AD-11001100-93",
  unit: "팔레트 1개",
  standard: "ISO 14067:2018",
  boundary: "Cradle-to-Grave",
  total: 1.8859,
  stages: [
    { id: "raw", label: "원료 단계", value: 0.7915 },
    { id: "manufacturing", label: "제조 단계", value: 2.1636 },
    { id: "transport", label: "완제품 운송", value: 0.9148 },
    { id: "disposal", label: "폐기 단계", value: -1.984 },
  ],
} as const;

export const productFamilies = [
  {
    id: "single-deck",
    title: "단면형 압축성형 목재 팔레트",
    englishLabel: "Single-Deck Compressed Wood Pallet",
    series: "AD",
    description: "일반 수출 포장과 보관 환경에 적용할 수 있는 단면형 제품군입니다. 제품 규격과 하중은 모델별로 확인해야 합니다.",
    features: ["단면형 구조", "중첩 보관 가능 모델", "AD 계열 사양 적용", "적용 전 하중 검토 필요"],
  },
  {
    id: "double-deck",
    title: "양면형 압축성형 목재 팔레트",
    englishLabel: "Double-Deck Compressed Wood Pallet",
    series: "AS",
    description: "상·하부 구조와 고중량 화물 적재조건을 고려한 양면형 제품군입니다.",
    features: ["양면형 구조", "제조사 제시 정하중 최대 10,000kg", "고중량 산업재 검토", "적용 전 설비조건 확인"],
  },
  {
    id: "three-runner",
    title: "3열 받침형 압축성형 목재 팔레트",
    englishLabel: "3-Runner Compressed Wood Pallet",
    series: "AC",
    description: "3열 받침 구조를 적용해 지게차 운용과 적재 안정성을 고려한 제품군입니다.",
    features: ["3열 받침 구조", "포크 진입조건 검토", "제조사 제시 정하중 9,000kg", "AC 계열 사양 적용"],
  },
  {
    id: "custom",
    title: "특수형 압축성형 목재 팔레트",
    englishLabel: "Custom Compressed Wood Pallet",
    series: "Custom",
    description: "화물 형상, 설비, 보관과 운송조건에 맞춰 특수 규격 또는 구조의 설계 가능성을 상담하는 제품군입니다.",
    features: ["특수 규격 상담", "금형 및 구조 검토", "자동화 설비 조건 검토", "최종 사양 별도 협의"],
  },
] as const;

const adModels: ModelSpecification[] = [
  ["AD-1200800-93", 1200, "800/810", 130, false],
  ["AD-10001000-93", 1000, "1000", 130, false],
  ["AD-10501050-93", 1050, "1050", 130, false],
  ["AD-11001100-93", 1100, "1100", 130, false],
  ["AD-11401140-93", 1140, "1140", 130, false],
  ["AD-12001000-93", 1200, "1000", 130, false],
  ["AD-12001100-93", 1200, "1100", 130, false],
  ["AD-13001100-93", 1300, "1100", 130, false],
  ["AD-12501000-93", 1250, "1000", 130, true],
  ["AD-1100900-93", 1100, "900", 116, false],
].map(([model, length, width, height, confirmationRequired], index) => ({
  id: `ad-${index + 1}`,
  series: "AD",
  type: "단면형",
  model: String(model),
  length: Number(length),
  width: String(width),
  height: Number(height),
  forkClearance: 93,
  dynamicLoad: 2000,
  staticLoad: 8000,
  confirmationRequired: Boolean(confirmationRequired),
}));

const acModels: ModelSpecification[] = [
  ["AC-10001000-93", 1000, "1000"],
  ["AC-10501050-93", 1050, "1050"],
  ["AC-11001100-93", 1100, "1100"],
  ["AC-11401140-93", 1140, "1140"],
  ["AC-12001000-93", 1200, "1000"],
  ["AC-13001100-93", 1300, "1100"],
].map(([model, length, width], index) => ({
  id: `ac-${index + 1}`,
  series: "AC",
  type: "3열 받침형",
  model: String(model),
  length: Number(length),
  width: String(width),
  height: 145,
  forkClearance: 93,
  dynamicLoad: 2500,
  staticLoad: 9000,
}));

const asModels: ModelSpecification[] = [
  ["AS-11001100-93", 1100, "1100"],
  ["AS-11401140-93", 1140, "1140"],
  ["AS-12001000-93", 1200, "1000"],
  ["AS-13001100-93", 1300, "1100"],
].map(([model, length, width], index) => ({
  id: `as-${index + 1}`,
  series: "AS",
  type: "양면형",
  model: String(model),
  length: Number(length),
  width: String(width),
  height: 145,
  forkClearance: 93,
  dynamicLoad: 2800,
  staticLoad: 10000,
}));

export const allModelSpecifications = [...adModels, ...acModels, ...asModels];

export const applicationCheckGroups = [
  { id: "cargo-size", title: "화물 규격", fields: ["화물 길이", "화물 너비", "화물 높이", "포장 단위"] },
  { id: "cargo-weight", title: "화물 중량", fields: ["단위 화물 중량", "팔레트당 총중량", "최대 집중하중", "하중분포", "무게중심 위치"] },
  { id: "stacking", title: "적재 방식", fields: ["바닥 적재", "다단 적재", "랙 적재", "동적 이동", "장기 보관"] },
  { id: "rack", title: "랙 조건", fields: ["랙 사용 여부", "랙 빔 간격", "팔레트 지지점", "랙 방향", "처짐 허용조건"] },
  { id: "forklift", title: "지게차 조건", fields: ["포크 진입 방향", "포크 폭", "포크 길이", "핸드파레트트럭 사용 여부", "지게차 종류"] },
  { id: "automation", title: "자동화 설비", fields: ["컨베이어 사용 여부", "롤러 간격", "체인 컨베이어 여부", "자동창고 여부", "센서 감지 조건"] },
  { id: "storage", title: "보관 환경", fields: ["실내", "실외", "습기", "온도", "장기 보관", "세척 여부"] },
  { id: "export", title: "수출·운송", fields: ["목적국", "해상·항공·육상 운송", "컨테이너 규격", "1회용 또는 회수형", "월 사용량"] },
] as const;

export const companyCapabilities = [
  { id: "experience", value: "20+", label: "관련 산업 경험", description: "제조사 제공자료상 관련 산업 경험 20년 이상" },
  { id: "investment", value: "2.2억 위안", label: "총 투자", description: "제조사 제공자료 기준" },
  { id: "area", value: "40,000㎡", label: "총 부지면적", description: "제조사 제공자료 기준" },
  { id: "capacity", value: "1,200만 개", label: "설계 연간 생산능력", description: "제조사 제공자료 기준" },
  { id: "sites", value: "3개", label: "생산기지", description: "화동·화중·화남" },
  { id: "marketing", value: "2개", label: "마케팅센터", description: "상하이·허페이" },
  { id: "rnd", value: "독일", label: "국제 R&D", description: "뒤셀도르프 거점" },
  { id: "documents", value: "30+", label: "특허 및 관련 증서", description: "특허 및 관련 증서 30건 이상" },
] as const;

export const rndQualityTabs = [
  { id: "design", title: "구조·금형 설계", items: ["제품 하부 보강 구조 설계", "금형 치수 설계", "제품 형상 검토", "특수 화물 대응 구조 검토", "3D 제품 개발 자료"] },
  { id: "equipment", title: "생산설비", items: ["압축성형 설비", "생산라인", "원료 준비설비", "혼합설비", "검사·출하 공정", "실제 확인 가능한 설비 사진만 사용"] },
  { id: "quality", title: "품질관리", items: ["원료 상태 확인", "함수율 관리", "성형조건 관리", "외관 확인", "규격 확인", "출하 전 확인"] },
  { id: "collaboration", title: "연구개발 협력", items: ["독일식 정밀 제조 철학", "TOGREEN 공동 연구개발 관련 제조사 제공 설명", "독일 뒤셀도르프 R&D 거점", "고객 화물과 장비 조건에 따른 맞춤 구조 검토"] },
] as const;

export const catalogDocuments: CatalogDocument[] = [
  {
    id: "national-2025",
    title: "2025 국가포장제품품질검사센터 시험자료",
    category: "물리성능",
    issuer: "국가포장제품품질검사센터",
    documentNumber: "TJA20251108-0015",
    issueDate: "2025.02.21",
    relatedProduct: "1100 × 1100 × 130mm 제출 시료",
    summary: "포크 인양, 상판 집중하중과 물리성능 시험",
    scope: ["포크 인양", "상판 집중하중", "지지다리 압축", "밀도", "함수율", "흡수 두께팽창률"],
    caution: ["제출 시료 한정", "지지다리 압축 항목은 CNAS 인정범위 밖", "사용·부분 복제 제한은 원문 확인"],
    publicDownload: false,
    visible: true,
    sourceType: "THIRD_PARTY_TEST",
  },
  {
    id: "tbk-2026-physical",
    title: "2026 TBK 물리성능 시험자료",
    category: "물리성능",
    issuer: "Suzhou TBK Testing Technology Co., Ltd.",
    documentNumber: "TBK20260318Lab10101-2A",
    issueDate: "2026.04.02",
    relatedProduct: "1100 × 1100 제출 시료 3개",
    summary: "밀도, 함수율, 흡수 두께팽창률, 내부결합강도와 하중 시험",
    scope: ["밀도", "함수율", "흡수 두께팽창률", "내부결합강도", "포크 인양", "상판 집중하중"],
    caution: ["제출 시료 한정", "기업 연구개발과 내부 품질관리 목적 제한", "공개 다운로드 허가 여부 확인 필요"],
    publicDownload: false,
    visible: true,
    sourceType: "THIRD_PARTY_TEST",
  },
  {
    id: "tbk-2026-formaldehyde",
    title: "2026 TBK 포름알데히드 방출량 시험",
    category: "포름알데히드",
    issuer: "Suzhou TBK Testing Technology Co., Ltd.",
    documentNumber: "TBK20260318Lab10101-1A",
    issueDate: "2026.04.02",
    relatedProduct: "1100 × 1100 제출 시료 1개",
    summary: "제출 시료의 포름알데히드 방출량 측정",
    keyResult: "0.9mg/L",
    scope: ["GB/T 17657-2022", "방법검출한계 0.1mg/L"],
    caution: ["제출 시료 한정", "적합 판정 또는 기준값 없음", "0 포름알데히드로 표현하지 않음"],
    publicDownload: false,
    visible: true,
    sourceType: "THIRD_PARTY_TEST",
  },
  {
    id: "sgs-carbon",
    title: "제품 탄소발자국 검증 성명서",
    category: "탄소발자국",
    issuer: "SGS",
    documentNumber: "CN25/00002415",
    relatedProduct: "AD-11001100-93",
    summary: "ISO 14067:2018 기반 Cradle-to-Grave 제품 탄소발자국 검증",
    keyResult: "팔레트 1개당 1.8859kg CO₂e",
    scope: ["AD-11001100-93", "팔레트 1개", "Cradle-to-Grave"],
    caution: ["다른 모델에 확대 적용하지 않음"],
    publicDownload: false,
    visible: true,
    sourceType: "SGS_VERIFICATION",
  },
  {
    id: "udem-en14374",
    title: "EN 14374:2004 기술 적합성 확인서",
    category: "기술 적합성",
    issuer: "UDEM",
    documentNumber: "M.2024.206.C101693",
    issueDate: "2024.06.04",
    expiryDate: "2029.06.03",
    relatedProduct: "Compressed Wood Pallet",
    summary: "문서에 기재된 제품 유형에 대한 기술 적합성 확인서",
    scope: ["Single Deck", "Double Deck", "Chuan Design", "Specialty"],
    caution: ["CE 인증으로 표시하지 않음", "문서 기재 제품 유형 범위만 적용"],
    publicDownload: false,
    visible: true,
    sourceType: "OFFICIAL_REGISTRATION",
  },
  {
    id: "fsc-coc",
    title: "FSC Chain of Custody 인증서",
    category: "FSC",
    issuer: "Extensive Standard Technical Services Co., Ltd.",
    documentNumber: "ESTS-COC-260135",
    issueDate: "2026.02.25",
    expiryDate: "2031.02.24",
    relatedProduct: "W10.1 Solid wood packaging · W10.3 Pallets and skids",
    summary: "FSC Chain of Custody 인증 범위 확인",
    scope: ["W10.1 Solid wood packaging", "W10.3 Pallets and skids", "FSC 100% 또는 FSC Mix"],
    caution: ["모든 개별 제품의 FSC 인증을 의미하지 않음", "판매·납품 문서에 FSC claim이 표시된 제품에 한해 적용"],
    publicDownload: false,
    visible: true,
    sourceType: "OFFICIAL_REGISTRATION",
  },
  {
    id: "hefei-customs",
    title: "출경 목질포장 열처리 표시 등록증",
    category: "수출·등록",
    issuer: "합비해관",
    documentNumber: "3319MBZ114 · CN-33216 HT",
    expiryDate: "2024.09.02–2027.09.01",
    relatedProduct: "열처리 표시 부착 권한 관련 등록",
    summary: "제조사의 출경 목질포장 열처리 표시 등록문서",
    scope: ["등록 유형: 열처리", "표시번호: CN-33216 HT"],
    caution: ["전 세계 자동 면제를 증명하는 문서가 아님", "ISPM 15 면제 증명서로 표현하지 않음"],
    publicDownload: false,
    visible: true,
    sourceType: "OFFICIAL_REGISTRATION",
  },
];
