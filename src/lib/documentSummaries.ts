export type SummaryMetadata = { label: string; value: string };

export type SummaryResult = {
  name: string;
  standard: string;
  value: string;
  judgement: string;
};

export type LifecycleStage = { label: string; value: number };

export type KoreanDocumentSummary = {
  published: boolean;
  kind: "test" | "formaldehyde" | "carbon";
  overview: SummaryMetadata[];
  results: SummaryResult[];
  testStandards: string[];
  environment: SummaryMetadata[];
  verificationScope: string[];
  cautions: string[];
  highlight?: { label: string; value: string };
  lifecycleStages?: LifecycleStage[];
};

const commonCautions = [
  "한국어 내용은 원문 이해를 돕기 위한 요약입니다.",
  "공식 내용은 원문 문서를 기준으로 합니다.",
];

export const defaultDocumentSummaries: KoreanDocumentSummary[] = [
  {
    published: true,
    kind: "test",
    overview: [
      { label: "시험 구분", value: "의뢰시험" },
      { label: "시험기관", value: "국가포장제품품질검사센터" },
      { label: "보고서 번호", value: "TJA20251108-0015" },
      { label: "발급일", value: "2025년 2월 21일" },
      { label: "시험기간", value: "2025.02.17–2025.02.20" },
      { label: "시료명", value: "압축성형 팔레트" },
      { label: "규격", value: "1100 × 1100 × 130mm" },
      { label: "시료 수량", value: "4개" },
      { label: "생산 배치", value: "ADS20241220" },
    ],
    results: [
      { name: "포크 인양시험", standard: "≥ 1,800kg", value: "2,818kg", judgement: "적합" },
      { name: "상판 집중하중", standard: "≥ 7,000kg", value: "8,447kg", judgement: "적합" },
      { name: "지지다리 압축성능", standard: "≥ 2,000kg", value: "2,462kg", judgement: "적합" },
      { name: "밀도", standard: "≥ 0.80g/cm³", value: "1.01g/cm³", judgement: "적합" },
      { name: "함수율", standard: "≤ 10%", value: "7.5%", judgement: "적합" },
      { name: "흡수 두께 팽창률", standard: "≤ 15%", value: "8.6%", judgement: "적합" },
    ],
    testStandards: ["시험성적서에 기재된 항목별 기준값에 따라 판정"],
    environment: [],
    verificationScope: ["제출된 압축성형 팔레트 시료 4개의 성능 시험"],
    cautions: [
      "시험 결과는 제출된 시료에 한해 적용됩니다.",
      "지지다리 압축성능은 원문상 CNAS 인정범위 외 시험항목입니다.",
      ...commonCautions,
    ],
  },
  {
    published: true,
    kind: "test",
    overview: [
      { label: "시험기관", value: "쑤저우 톈뱌오 시험기술유한회사" },
      { label: "보고서 번호", value: "TBK20260318Lab10101-2A" },
      { label: "발급일", value: "2026년 4월 2일" },
      { label: "시험기간", value: "2026.03.20–2026.04.01" },
      { label: "시료명", value: "압축성형 팔레트" },
      { label: "규격", value: "1100 × 1100" },
      { label: "시료 수량", value: "3개" },
      { label: "시험 목적", value: "물리성능 확인" },
    ],
    results: [
      { name: "밀도", standard: "≥ 0.80g/cm³", value: "0.95g/cm³", judgement: "적합" },
      { name: "함수율", standard: "< 10%", value: "7.50%", judgement: "적합" },
      { name: "흡수 두께 팽창률", standard: "< 15%", value: "13.59%", judgement: "적합" },
      { name: "내부결합강도", standard: "≥ 0.60MPa", value: "0.65MPa", judgement: "적합" },
      { name: "포크 인양성능", standard: "≥ 1,800kg", value: "2,560kg", judgement: "적합" },
      { name: "상판 집중하중 성능", standard: "≥ 7,000kg", value: "8,220kg", judgement: "적합" },
    ],
    testStandards: ["시험성적서에 기재된 항목별 기준값에 따라 판정"],
    environment: [
      { label: "온도", value: "20℃" },
      { label: "습도", value: "55%RH" },
    ],
    verificationScope: ["제출된 압축성형 팔레트 시료 3개의 물리성능 시험"],
    cautions: commonCautions,
  },
  {
    published: true,
    kind: "formaldehyde",
    overview: [
      { label: "시험기관", value: "쑤저우 톈뱌오 시험기술유한회사" },
      { label: "보고서 번호", value: "TBK20260318Lab10101-1A" },
      { label: "발급일", value: "2026년 4월 2일" },
    ],
    results: [],
    testStandards: ["시험방법: GB/T 17657-2022", "검출한계: 0.1mg/L"],
    environment: [
      { label: "시험환경", value: "21℃ / 57%RH" },
      { label: "시료 규격", value: "1100 × 1100" },
      { label: "시료 수량", value: "1개" },
    ],
    verificationScope: ["제출된 시료의 포름알데히드 방출량 시험"],
    cautions: commonCautions,
    highlight: { label: "포름알데히드 방출량", value: "0.9mg/L" },
  },
  {
    published: true,
    kind: "carbon",
    overview: [
      { label: "적용 모델", value: "AD-11001100-93" },
      { label: "기능단위", value: "팔레트 1개" },
      { label: "검증기준", value: "ISO 14067:2018" },
      { label: "검증기관", value: "SGS" },
      { label: "검증방식", value: "제3자 검증" },
    ],
    results: [],
    testStandards: ["ISO 14067:2018"],
    environment: [],
    verificationScope: ["AD-11001100-93 모델 팔레트 1개를 기능단위로 한 제품 탄소발자국"],
    cautions: [
      "해당 수치는 AD-11001100-93 모델 1개 기준입니다.",
      "다른 모델에 동일 수치를 적용하지 않습니다.",
      "제품 탄소발자국이 10% 이상 변경되면 재검증이 필요합니다.",
      "원문 전체 검증 범위와 함께 해석해야 합니다.",
      ...commonCautions,
    ],
    highlight: { label: "제품 1개 탄소발자국", value: "1.8859kg CO₂e" },
    lifecycleStages: [
      { label: "원재료", value: 0.7915 },
      { label: "제조", value: 2.1636 },
      { label: "완제품 운송", value: 0.9148 },
      { label: "폐기", value: -1.984 },
    ],
  },
];
