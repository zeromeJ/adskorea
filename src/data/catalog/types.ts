export type SourceType =
  | "THIRD_PARTY_TEST"
  | "SGS_VERIFICATION"
  | "MANUFACTURER_DATA"
  | "MANUFACTURER_SPEC"
  | "OFFICIAL_REGISTRATION"
  | "MANUFACTURER_CASE";

export type TestMetric = {
  id: string;
  name: string;
  value: string;
  referenceValue?: string;
  judgement?: string;
  note?: string;
};

export type TestResult = {
  id: string;
  reportTitle: string;
  reportNumber: string;
  issuer: string;
  issuerEn?: string;
  issueDate: string;
  sample: string[];
  testPeriod: string;
  environment?: string[];
  method?: string;
  metrics: TestMetric[];
  limitations: string[];
  sourceType: SourceType;
  documentId: string;
};

export type ModelSpecification = {
  id: string;
  series: "AD" | "AC" | "AS";
  type: string;
  model: string;
  length: number;
  width: string;
  height: number;
  forkClearance: number;
  dynamicLoad: number;
  staticLoad: number;
  confirmationRequired?: boolean;
};

export type CatalogDocument = {
  id: string;
  title: string;
  category:
    | "물리성능"
    | "포름알데히드"
    | "탄소발자국"
    | "기술 적합성"
    | "FSC"
    | "수출·등록";
  issuer: string;
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string;
  relatedProduct: string;
  summary: string;
  keyResult?: string;
  scope: string[];
  caution: string[];
  thumbnailUrl?: string;
  pdfUrl?: string;
  publicDownload: boolean;
  visible: boolean;
  sourceType: SourceType;
};

export type CatalogApplicationCase = {
  id: string;
  title: string;
  companyName?: string;
  companyNameVisible: boolean;
  cargoType: string;
  environment: string;
  documentedWeightKg?: number;
  weightText: string;
  imageUrl?: string;
  imageAlt: string;
  sourceType: SourceType;
  sourceDocument?: string;
  publicApproved: boolean;
  visible: boolean;
  category:
    | "톤백·포대"
    | "드럼·용기"
    | "박스"
    | "산업부품"
    | "창고·랙"
    | "운송";
};
