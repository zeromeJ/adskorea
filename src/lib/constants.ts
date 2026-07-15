import { defaultDocumentSummaries } from "@/lib/documentSummaries";

export const company = {
  brandName: "ADS 아델슨",
  brandNameEn: "ADS",
  legalName: "",
  manufacturerName: "",
  salesCompanyName: "",
  email: "hello@adskorea.co.kr",
  phone: "",
  phoneHref: "",
  address: "",
};

export const navItems = [
  {
    label: "제품 소개",
    href: "#product-overview",
    children: [
      { label: "제품 개요", href: "#product-overview" },
      { label: "제조공정", href: "#manufacturing-process" },
      { label: "제품 소개영상", href: "#product-overview-video" },
      { label: "핵심 장점", href: "#benefits" },
    ],
  },
  {
    label: "성능·기술",
    href: "#performance",
    children: [
      { label: "성능 검증", href: "#performance" },
      { label: "성능 시연 영상", href: "#performance-videos" },
      { label: "기술자료·시험·인증", href: "#documents" },
    ],
  },
  {
    label: "제품 라인업",
    href: "#product-lineup",
    children: [
      { label: "단면형", href: "#product-single-deck" },
      { label: "양면형", href: "#product-double-deck" },
      { label: "3열 받침형", href: "#product-three-runner" },
      { label: "주문제작형", href: "#product-custom" },
    ],
  },
  {
    label: "적용 분야",
    href: "#applications",
    children: [
      { label: "적용 전 확인사항", href: "#pre-application" },
      { label: "적용 산업", href: "#applications" },
    ],
  },
  { label: "환경 데이터", href: "#environment", children: [] },
  {
    label: "회사·생산",
    href: "#company",
    children: [
      { label: "회사 개요·생산 역량", href: "#company" },
      { label: "회사 소개영상", href: "#company-overview-video" },
    ],
  },
];

export const heroMetrics = [
  {
    value: "2,818kg",
    label: "Test Result",
    description: "제3자 포크 인양시험 실측값",
  },
  {
    value: "8,447kg",
    label: "Test Result",
    description: "제3자 상판 집중하중 실측값",
  },
  {
    value: "1.8859kg CO₂e",
    label: "Verified Carbon Footprint",
    description: "AD-11001100-93 · 팔레트 1개 기준",
  },
];

export const problemCards = [
  {
    title: "수출 규정",
    description: "목적국별 포장재 규정과 처리요건을 확인해야 합니다.",
  },
  {
    title: "보관 공간",
    description:
      "비사용 팔레트의 적층 구조와 창고 점유를 검토합니다.",
  },
  {
    title: "작업 안전",
    description:
      "못, 균열과 변형에 따른 화물·작업 위험을 확인합니다.",
  },
  {
    title: "물류 총비용",
    description:
      "구매가 외 보관·운송·교체비용까지 함께 검토합니다.",
  },
];

export const processSteps = [
  "원료 선별",
  "1차 파쇄",
  "미세 분쇄",
  "건조 및 함수율 조정",
  "MDI계 접착제 혼합",
  "고온·고압 압축성형",
  "검사 및 출하",
];

export const benefits = [
  {
    eyebrow: "Export Management",
    title: "수출 포장 관리를 더 간편하게",
    description:
      "접착제·열·압력을 이용해 제조된 가공목재 제품입니다. 제품 구성과 목적국 규정에 따라 ISPM 15 적용 제외 대상이 될 수 있어 수출 포장재 관리 부담을 줄이는 데 도움이 됩니다.",
    points: [
      "가공목재 기반 구조",
      "목적국 규정에 따라 ISPM 15 적용 제외 가능",
      "수출 포장재 관리 부담 완화",
    ],
  },
  {
    eyebrow: "Storage Efficiency",
    title: "중첩 적재로 보관 효율 향상",
    description:
      "일체형 구조와 중첩 적재가 가능한 제품군을 통해 미사용 팔레트의 보관 부피를 줄일 수 있습니다. 실제 적층수량은 제품 모델과 적재조건에 따라 달라집니다.",
    points: [
      "중첩 적재 구조",
      "미사용 팔레트 보관 부피 절감",
      "모델별 적층조건 확인",
    ],
  },
  {
    eyebrow: "Total Logistics Cost",
    title: "팔레트 단가가 아닌 물류 총비용 관점",
    description:
      "구매단가뿐 아니라 보관공간, 수출 처리, 운송 효율, 파손 위험 및 교체주기를 함께 검토할 수 있습니다. 실제 절감효과는 사용수량과 물류조건에 따라 달라집니다.",
    points: [
      "보관 효율 검토",
      "수출 포장 운영비 검토",
      "조건별 비용절감 분석",
    ],
  },
];

export const performanceFeatureGroups = [
  { title: "제품 구조", items: ["고온·고압 일체형 압축성형", "못 없는 일체형 구조", "균일한 규격과 구조"] },
  { title: "시험 확인 항목", items: ["포크 인양성능", "상판 집중하중", "함수율", "흡수 두께 팽창률", "내부결합강도", "포름알데히드 방출량"] },
  { title: "적용 검토", items: ["화물별 적재조건", "랙 구조", "자동화 설비", "지게차 진입 방향", "보관·운송 환경"] },
];

export const testGroups = [
  {
    id: "national-2025",
    label: "2025 국가포장제품품질검사센터 시험",
    organization: "국가포장제품품질검사센터",
    classification: "의뢰시험",
    documentType: "시험기관 발행 자료",
    reportNumber: "TJA20251108-0015",
    issueDate: "2025년 2월 21일",
    testDate: "2025.02.17–2025.02.20",
    specimen: "압축성형 팔레트 · 1100 × 1100 × 130mm · 4개 · 생산 배치 ADS20241220",
    results: [
      { name: "포크 인양시험", value: "2,818kg", referenceValue: "≥ 1,800kg", judgement: "적합" },
      { name: "상판 집중하중", value: "8,447kg", referenceValue: "≥ 7,000kg", judgement: "적합" },
      { name: "지지다리 압축성능", value: "2,462kg", referenceValue: "≥ 2,000kg", judgement: "적합", note: "※ 해당 시험항목은 시험성적서상 CNAS 인정범위에 포함되지 않습니다." },
      { name: "밀도", value: "1.01g/cm³", referenceValue: "≥ 0.80g/cm³", judgement: "적합" },
      { name: "함수율", value: "7.5%", referenceValue: "≤ 10%", judgement: "적합" },
      { name: "흡수 두께 팽창률", value: "8.6%", referenceValue: "≤ 15%", judgement: "적합" },
    ],
    notices: ["본 시험결과는 제출된 시료에 한해 적용됩니다.", "지지다리 압축성능 항목은 시험성적서상 CNAS 인정범위에 포함되지 않습니다.", "시험성적서의 사용과 공개는 원문에 기재된 제한조건을 따릅니다."],
  },
  {
    id: "tbk-2026",
    label: "2026 TBK 시험",
    organization: "쑤저우 톈뱌오 시험기술유한회사",
    classification: "의뢰시험",
    documentType: "시험기관 발행 자료",
    reportNumber: "TBK20260318Lab10101-2A",
    issueDate: "2026년 4월 2일",
    testDate: "2026.03.20–2026.04.01",
    specimen: "압축성형 팔레트 · 1100 × 1100 · 3개",
    results: [
      { name: "밀도", value: "0.95g/cm³", referenceValue: "≥ 0.80g/cm³", judgement: "적합" },
      { name: "함수율", value: "7.50%", referenceValue: "< 10%", judgement: "적합" },
      { name: "흡수 두께 팽창률", value: "13.59%", referenceValue: "< 15%", judgement: "적합" },
      { name: "내부결합강도", value: "0.65MPa", referenceValue: "≥ 0.60MPa", judgement: "적합" },
      { name: "포크 인양성능", value: "2,560kg", referenceValue: "≥ 1,800kg", judgement: "적합" },
      { name: "상판 집중하중", value: "8,220kg", referenceValue: "≥ 7,000kg", judgement: "적합" },
    ],
  },
];

export const modelSpecs = [
  {
    model: "AD 계열",
    type: "단면형",
    size: "1200 × 1000 × 130mm 등",
    dynamicLoad: "2,000kg",
    staticLoad: "8,000kg",
    usage: "일반 수출 포장·보관",
  },
  {
    model: "AC 계열",
    type: "3열 받침형",
    size: "1000 × 1000 × 145mm 등",
    dynamicLoad: "2,500kg",
    staticLoad: "9,000kg",
    usage: "고중량 화물·지게차 운용",
  },
  {
    model: "AS 계열",
    type: "양면형",
    size: "1100 × 1100 × 145mm 등",
    dynamicLoad: "2,800kg",
    staticLoad: "10,000kg",
    usage: "고중량 산업재",
  },
];

export const modelSpecDisclaimer =
  "상기 하중과 용도 표기는 제조사 제시 사양을 바탕으로 한 참고정보이며, 실제 적용 가능 여부는 화물, 설비와 사용환경 검토 후 확정됩니다.";

export const sustainabilityData = {
  model: "AD-11001100-93",
  value: "1.8859",
  unit: "kg CO₂e / pallet",
  standard: "ISO 14067:2018",
  verifier: "SGS 제3자 검증",
  statementNumber: "CN25/00002415",
  issueDate: "2025년 5월 7일",
  description:
    "제품 1개 기준 검증값입니다. 시스템 경계와 제외 항목은 제품 탄소발자국 검증 성명서를 참조하십시오.",
};

export const sustainabilityPoints = [
  "농림업 부산물 및 목질 원료 활용",
  "MDI계 접착 시스템 적용",
  "ISO 14067 기반 제품 탄소발자국 산정",
  "SGS 제3자 검증",
];

export const products = [
  {
    title: "단면 압축 목재 팔레트",
    englishLabel: "Single-Sided Molded Pallet",
    description:
      "수출 포장과 일반 적재 환경에 적용할 수 있는 친환경 압축 목재 팔레트입니다.",
    specs: ["수출 포장 대응", "중첩 보관 구조", "모델별 사양 상이"],
    mediaField: "product.singleDeck.gallery",
  },
  {
    title: "양면 압축 목재 팔레트",
    englishLabel: "Double-Sided Molded Pallet",
    description:
      "상·하부 구조 안정성과 고중량 화물 운송 및 고단 적재 조건을 고려한 제품군입니다.",
    specs: ["고중량 적재조건 검토", "안정적인 일체형 구조", "모델별 사양 상이"],
    mediaField: "product.doubleDeck.gallery",
  },
  {
    title: "川자형 몰드 팔레트",
    englishLabel: "3-Runner Compressed Wood Pallet",
    description:
      "3열 받침 구조를 적용해 지게차 운용, 적재 안정성과 운송 효율을 함께 고려한 압축 목재 팔레트입니다.",
    specs: ["고강도 압축 구조", "보관 효율 개선", "수출 포장 대응"],
    mediaField: "product.threeRunner.gallery",
  },
  {
    title: "특수 몰드 팔레트",
    englishLabel: "Custom Compressed Wood Pallet",
    description:
      "제품 특성, 보관 환경과 수출 조건에 따라 특수 규격과 구조를 상담할 수 있습니다.",
    specs: ["특수 용도 대응", "기술 적합성 검토", "상담 필요"],
    mediaField: "product.custom.gallery",
  },
];

export const industries = [
  {
    title: "화학·석유화학",
    description: "톤백, 포대, 철제 드럼 및 중량 화물의 적재·운송 조건 검토",
    icon: "FlaskConical",
  },
  {
    title: "톤백·포대 포장",
    description: "산업용 원료와 분말·수지 제품의 대량 포장·출하 조건 검토",
    icon: "Package",
  },
  {
    title: "철제 드럼",
    description: "원형 용기와 중량 화물의 안정적인 적재 구조 검토",
    icon: "Cylinder",
  },
  {
    title: "자동화 물류창고",
    description: "균일한 규격과 구조를 기반으로 자동화 설비 적용 가능성 검토",
    icon: "Warehouse",
  },
  {
    title: "수출 컨테이너",
    description: "수출 포장재 관리와 적재·보관 조건 검토",
    icon: "Container",
  },
  {
    title: "산업 원료·소재",
    description: "화학원료, 수지, 소재 및 산업 자재의 적재·운송 조건 검토",
    icon: "Boxes",
  },
];

export const performanceVideoFallbacks = [
  {
    title: "알루미늄 잉곳 고중량 적재 시연",
    titleEn: "Aluminum Ingot Load Demonstration",
    category: "heavy-load",
    durationSeconds: 45,
    description:
      "알루미늄 잉곳을 적재한 상태에서 압축성형 목재 팔레트의 구조와 외관 상태를 확인하는 제조사 제공 시연영상입니다.",
    disclaimer:
      "시연에 사용된 화물의 총중량이 확인되지 않은 참고자료이며, 공식 하중성능은 별도의 시험성적서를 참조하십시오.",
  },
  {
    title: "차량 하중 시연",
    titleEn: "Vehicle Load Demonstration",
    category: "vehicle-load",
    durationSeconds: 33,
    description:
      "차량 하중이 가해지는 상황에서 제품의 구조 상태를 직관적으로 보여주는 제조사 제공 시연영상입니다.",
    disclaimer:
      "제품 강도를 직관적으로 보여주기 위한 시연자료입니다. 공식 하중성능은 별도의 시험성적서를 참조하십시오.",
  },
  {
    title: "화염 노출 시 제품 상태 시연",
    titleEn: "Flame Exposure Demonstration",
    category: "flame-exposure",
    durationSeconds: 25,
    description:
      "일정 시간 화염에 노출된 제품의 외관과 상태를 보여주는 제조사 제공 시연영상입니다.",
    disclaimer:
      "표준 난연시험 또는 난연등급을 증명하는 영상이 아닙니다. 확인되지 않은 난연·내열 수치는 표시하지 않습니다.",
  },
  {
    title: "낙하 충격 시연",
    titleEn: "Drop Impact Demonstration",
    category: "drop-impact",
    durationSeconds: 6,
    description:
      "제품을 일정 높이에서 낙하시킨 뒤 구조와 외관 상태를 확인하는 제조사 제공 시연영상입니다.",
    disclaimer:
      "낙하 높이와 횟수가 확인되지 않은 제조사 제공 시연자료이며 표준 낙하시험을 의미하지 않습니다.",
  },
  {
    title: "압력 하중 시연",
    titleEn: "Compression Load Demonstration",
    category: "compression-load",
    durationSeconds: 13,
    description:
      "외부 압력 또는 차량 하중이 가해지는 상황에서 제품의 구조 상태를 보여주는 제조사 제공 시연영상입니다.",
    disclaimer:
      "표준 시험 방식과 적용 하중이 확인되지 않은 제조사 제공 시연자료입니다.",
  },
  {
    title: "침수 후 제품 상태 시연",
    titleEn: "Immersion Demonstration",
    category: "immersion",
    durationSeconds: 74,
    description:
      "제품을 물에 침수한 후 표면, 형태와 외관 상태를 확인하는 제조사 제공 시연영상입니다.",
    disclaimer:
      "방수 인증 또는 장기 수중 사용 성능을 증명하는 영상이 아닙니다. 공식 판단은 관련 제3자 시험자료를 참조하십시오.",
  },
];

export const documentCategories = [
  "전체",
  "카탈로그",
  "제품 성능 시험",
  "포름알데히드 시험",
  "탄소발자국 검증",
  "세관·수출",
  "SDS",
  "FSC CoC",
  "적합성 확인서",
  "특허·기술자료",
];

export const documents = [
  {
    title: "2025 국가포장제품품질검사센터 시험자료",
    documentType: "제품 성능 시험",
    issuer: "국가포장제품품질검사센터",
    reportNumber: "TJA20251108-0015",
    issueDate: "2025년 2월 21일",
    expiryDate: "별도 유효기간 기재 없음",
    relatedProducts: "압축성형 팔레트 · 1100 × 1100 × 130mm",
    language: "원문",
    fileUrl: "",
    publicPreview: true,
    koreanSummary: defaultDocumentSummaries[0],
  },
  {
    title: "2026 TBK 별도 시험자료",
    documentType: "제품 성능 시험",
    issuer: "쑤저우 톈뱌오 시험기술유한회사",
    reportNumber: "TBK20260318Lab10101-2A",
    issueDate: "2026년 4월 2일",
    expiryDate: "별도 유효기간 기재 없음",
    relatedProducts: "압축성형 팔레트 · 1100 × 1100",
    language: "원문",
    fileUrl: "",
    publicPreview: true,
    koreanSummary: defaultDocumentSummaries[1],
  },
  {
    title: "포름알데히드 방출량 시험자료",
    documentType: "포름알데히드 시험",
    issuer: "쑤저우 톈뱌오 시험기술유한회사",
    reportNumber: "TBK20260318Lab10101-1A",
    issueDate: "2026년 4월 2일",
    expiryDate: "별도 유효기간 기재 없음",
    relatedProducts: "압축성형 팔레트 · 1100 × 1100 · 시료 1개",
    language: "원문",
    fileUrl: "",
    summary: "포름알데히드 방출량 0.9mg/L · 방법 검출한계 0.1mg/L · GB/T 17657-2022",
    publicPreview: true,
    koreanSummary: defaultDocumentSummaries[2],
  },
  {
    title: "제품 탄소발자국 검증 성명서",
    documentType: "탄소발자국 검증",
    issuer: "SGS",
    reportNumber: "CN25/00002415",
    issueDate: "2025년 5월 7일",
    expiryDate: "별도 유효기간 기재 없음",
    relatedProducts: "AD-11001100-93",
    language: "원문",
    fileUrl: "",
    summary: "1.8859kg CO₂e / pallet · AD-11001100-93 · 기능 단위 팔레트 1개 · ISO 14067:2018",
    publicPreview: true,
    koreanSummary: defaultDocumentSummaries[3],
  },
];

export const companyStats = [
  { value: "20+", label: "Years", description: "20년 이상 산업 경험" },
  { value: "약 490억 원", label: "Investment", description: "총 투자액 환산 참고" },
  { value: "40,000㎡", label: "Site Area", description: "총 부지면적" },
  { value: "12M", label: "Designed Annual Capacity", description: "설계 연간 생산능력 1,200만 개" },
  { value: "30+", label: "Patents / Related Documents", description: "특허 및 관련 증서 30건 이상" },
];

export const companyNetwork: string[] = [];

export const industryOptions = [
  "화학·석유화학",
  "톤백·포대 포장",
  "철제 드럼",
  "자동화 물류창고",
  "수출 제조",
  "산업 원료·소재",
  "기타",
];

export const currentPalletTypeOptions = [
  "원목 팔레트",
  "플라스틱 팔레트",
  "압축성형 목재 팔레트",
  "혼합 사용",
  "잘 모르겠음",
  "없음",
];

export const productInterestOptions = [
  "단면 압축 목재 팔레트",
  "양면 압축 목재 팔레트",
  "川자형 몰드 팔레트",
  "특수 몰드 팔레트",
  "아직 정하지 않음",
];
