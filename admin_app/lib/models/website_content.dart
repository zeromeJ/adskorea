import 'dart:typed_data';

class WebsiteSectionSummary {
  const WebsiteSectionSummary(
      {required this.key,
      required this.title,
      required this.requiredCount,
      required this.registeredCount,
      required this.status,
      this.updatedAt,
      this.updatedByName});
  final String key, title, status;
  final int requiredCount, registeredCount;
  final DateTime? updatedAt;
  final String? updatedByName;
  factory WebsiteSectionSummary.fromJson(Map<String, dynamic> json) =>
      WebsiteSectionSummary(
        key: json['key'] as String,
        title: json['title'] as String,
        requiredCount: json['requiredCount'] as int? ?? 0,
        registeredCount: json['registeredCount'] as int? ?? 0,
        status: json['status'] as String? ?? '미등록',
        updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? ''),
        updatedByName: json['updatedByName'] as String?,
      );
}

class WebsiteAsset {
  WebsiteAsset(this.data);
  final Map<String, dynamic> data;
  String get itemKey => data['itemKey'] as String;
  String get label => data['label'] as String? ?? '';
  String? get url => data['url'] as String?;
  String? get originalUrl => data['originalUrl'] as String?;
}

class WebsiteSectionContent {
  const WebsiteSectionContent({required this.assets, required this.data});
  final List<WebsiteAsset> assets;
  final Map<String, dynamic> data;
}

class PendingImageEdit {
  const PendingImageEdit(
      {required this.original,
      required this.edited,
      required this.fileName,
      required this.width,
      required this.height,
      required this.crop,
      required this.zoom,
      required this.rotation});
  final Uint8List original, edited;
  final String fileName;
  final int width, height, rotation;
  final List<double> crop;
  final double zoom;
}

class PendingFileUpload {
  const PendingFileUpload({
    required this.bytes,
    required this.fileName,
    required this.mimeType,
  });

  final Uint8List bytes;
  final String fileName, mimeType;
}

enum WebsiteSlotType { image, pdf, video }

final websiteDocumentDefaults = <Map<String, dynamic>>[
  {
    'title': '2025 국가포장제품품질검사센터 시험자료',
    'documentType': '제품 성능 시험',
    'issuer': '국가포장제품품질검사센터',
    'reportNumber': 'TJA20251108-0015',
    'issueDate': '2025년 2월 21일',
    'expiryDate': '별도 유효기간 기재 없음',
    'relatedProducts': '압축성형 팔레트 · 1100 × 1100 × 130mm',
    'language': '원문',
    'summary': '',
    'koreanSummary': {
      'published': true,
      'kind': 'test',
      'overview': [
        {'label': '시험 구분', 'value': '의뢰시험'},
        {'label': '시험기관', 'value': '국가포장제품품질검사센터'},
        {'label': '보고서 번호', 'value': 'TJA20251108-0015'},
        {'label': '발급일', 'value': '2025년 2월 21일'},
        {'label': '시험기간', 'value': '2025.02.17–2025.02.20'},
        {'label': '시료명', 'value': '압축성형 팔레트'},
        {'label': '규격', 'value': '1100 × 1100 × 130mm'},
        {'label': '시료 수량', 'value': '4개'},
        {'label': '생산 배치', 'value': 'ADS20241220'},
      ],
      'results': [
        {
          'name': '포크 인양시험',
          'standard': '≥ 1,800kg',
          'value': '2,818kg',
          'judgement': '적합'
        },
        {
          'name': '상판 집중하중',
          'standard': '≥ 7,000kg',
          'value': '8,447kg',
          'judgement': '적합'
        },
        {
          'name': '지지다리 압축성능',
          'standard': '≥ 2,000kg',
          'value': '2,462kg',
          'judgement': '적합'
        },
        {
          'name': '밀도',
          'standard': '≥ 0.80g/cm³',
          'value': '1.01g/cm³',
          'judgement': '적합'
        },
        {
          'name': '함수율',
          'standard': '≤ 10%',
          'value': '7.5%',
          'judgement': '적합'
        },
        {
          'name': '흡수 두께 팽창률',
          'standard': '≤ 15%',
          'value': '8.6%',
          'judgement': '적합'
        },
      ],
      'testStandards': ['시험성적서에 기재된 항목별 기준값에 따라 판정'],
      'environment': [],
      'verificationScope': ['제출된 압축성형 팔레트 시료 4개의 성능 시험'],
      'cautions': [
        '시험 결과는 제출된 시료에 한해 적용됩니다.',
        '지지다리 압축성능은 원문상 CNAS 인정범위 외 시험항목입니다.',
        '한국어 내용은 원문 이해를 돕기 위한 요약입니다.',
        '공식 내용은 원문 문서를 기준으로 합니다.',
      ],
    },
  },
  {
    'title': '2026 TBK 별도 시험자료',
    'documentType': '제품 성능 시험',
    'issuer': '쑤저우 톈뱌오 시험기술유한회사',
    'reportNumber': 'TBK20260318Lab10101-2A',
    'issueDate': '2026년 4월 2일',
    'expiryDate': '별도 유효기간 기재 없음',
    'relatedProducts': '압축성형 팔레트 · 1100 × 1100',
    'language': '원문',
    'summary': '',
    'koreanSummary': {
      'published': true,
      'kind': 'test',
      'overview': [
        {'label': '시험기관', 'value': '쑤저우 톈뱌오 시험기술유한회사'},
        {'label': '보고서 번호', 'value': 'TBK20260318Lab10101-2A'},
        {'label': '발급일', 'value': '2026년 4월 2일'},
        {'label': '시험기간', 'value': '2026.03.20–2026.04.01'},
        {'label': '시료명', 'value': '압축성형 팔레트'},
        {'label': '규격', 'value': '1100 × 1100'},
        {'label': '시료 수량', 'value': '3개'},
        {'label': '시험 목적', 'value': '물리성능 확인'},
      ],
      'results': [
        {
          'name': '밀도',
          'standard': '≥ 0.80g/cm³',
          'value': '0.95g/cm³',
          'judgement': '적합'
        },
        {
          'name': '함수율',
          'standard': '< 10%',
          'value': '7.50%',
          'judgement': '적합'
        },
        {
          'name': '흡수 두께 팽창률',
          'standard': '< 15%',
          'value': '13.59%',
          'judgement': '적합'
        },
        {
          'name': '내부결합강도',
          'standard': '≥ 0.60MPa',
          'value': '0.65MPa',
          'judgement': '적합'
        },
        {
          'name': '포크 인양성능',
          'standard': '≥ 1,800kg',
          'value': '2,560kg',
          'judgement': '적합'
        },
        {
          'name': '상판 집중하중 성능',
          'standard': '≥ 7,000kg',
          'value': '8,220kg',
          'judgement': '적합'
        },
      ],
      'testStandards': ['시험성적서에 기재된 항목별 기준값에 따라 판정'],
      'environment': [
        {'label': '온도', 'value': '20℃'},
        {'label': '습도', 'value': '55%RH'},
      ],
      'verificationScope': ['제출된 압축성형 팔레트 시료 3개의 물리성능 시험'],
      'cautions': ['한국어 내용은 원문 이해를 돕기 위한 요약입니다.', '공식 내용은 원문 문서를 기준으로 합니다.'],
    },
  },
  {
    'title': '포름알데히드 방출량 시험자료',
    'documentType': '포름알데히드 시험',
    'issuer': '쑤저우 톈뱌오 시험기술유한회사',
    'reportNumber': 'TBK20260318Lab10101-1A',
    'issueDate': '2026년 4월 2일',
    'expiryDate': '별도 유효기간 기재 없음',
    'relatedProducts': '압축성형 팔레트 · 1100 × 1100 · 시료 1개',
    'language': '원문',
    'summary': '포름알데히드 방출량 0.9mg/L · 방법 검출한계 0.1mg/L · GB/T 17657-2022',
    'koreanSummary': {
      'published': true,
      'kind': 'formaldehyde',
      'overview': [
        {'label': '시험기관', 'value': '쑤저우 톈뱌오 시험기술유한회사'},
        {'label': '보고서 번호', 'value': 'TBK20260318Lab10101-1A'},
        {'label': '발급일', 'value': '2026년 4월 2일'},
      ],
      'results': [],
      'testStandards': ['시험방법: GB/T 17657-2022', '검출한계: 0.1mg/L'],
      'environment': [
        {'label': '시험환경', 'value': '21℃ / 57%RH'},
        {'label': '시료 규격', 'value': '1100 × 1100'},
        {'label': '시료 수량', 'value': '1개'},
      ],
      'verificationScope': ['제출된 시료의 포름알데히드 방출량 시험'],
      'cautions': ['한국어 내용은 원문 이해를 돕기 위한 요약입니다.', '공식 내용은 원문 문서를 기준으로 합니다.'],
      'highlight': {'label': '포름알데히드 방출량', 'value': '0.9mg/L'},
    },
  },
  {
    'title': '제품 탄소발자국 검증 성명서',
    'documentType': '탄소발자국 검증',
    'issuer': 'SGS',
    'reportNumber': 'CN25/00002415',
    'issueDate': '2025년 5월 7일',
    'expiryDate': '별도 유효기간 기재 없음',
    'relatedProducts': 'AD-11001100-93',
    'language': '원문',
    'summary':
        '1.8859kg CO₂e / pallet · AD-11001100-93 · 기능 단위 팔레트 1개 · ISO 14067:2018',
    'koreanSummary': {
      'published': true,
      'kind': 'carbon',
      'overview': [
        {'label': '적용 모델', 'value': 'AD-11001100-93'},
        {'label': '기능단위', 'value': '팔레트 1개'},
        {'label': '검증기준', 'value': 'ISO 14067:2018'},
        {'label': '검증기관', 'value': 'SGS'},
        {'label': '검증방식', 'value': '제3자 검증'},
      ],
      'results': [],
      'testStandards': ['ISO 14067:2018'],
      'environment': [],
      'verificationScope': ['AD-11001100-93 모델 팔레트 1개를 기능단위로 한 제품 탄소발자국'],
      'cautions': [
        '해당 수치는 AD-11001100-93 모델 1개 기준입니다.',
        '다른 모델에 동일 수치를 적용하지 않습니다.',
        '제품 탄소발자국이 10% 이상 변경되면 재검증이 필요합니다.',
        '원문 전체 검증 범위와 함께 해석해야 합니다.',
        '한국어 내용은 원문 이해를 돕기 위한 요약입니다.',
        '공식 내용은 원문 문서를 기준으로 합니다.',
      ],
      'highlight': {'label': '제품 1개 탄소발자국', 'value': '1.8859kg CO₂e'},
      'lifecycleStages': [
        {'label': '원재료', 'value': 0.7915},
        {'label': '제조', 'value': 2.1636},
        {'label': '완제품 운송', 'value': 0.9148},
        {'label': '폐기', 'value': -1.9840},
      ],
    },
  },
];

List<ImageSlot> websiteDocumentSlots(int index) => [
      ImageSlot(
          key: 'document${index + 1}',
          label: '문서 썸네일',
          ratio: 'A4 세로형',
          width: 900,
          height: 1273,
          description: '홈페이지 문서 카드에 표시할 표지 이미지를 직접 등록하세요.'),
    ];

class ImageSlot {
  const ImageSlot(
      {required this.key,
      required this.label,
      required this.ratio,
      required this.width,
      required this.height,
      required this.description,
      this.type = WebsiteSlotType.image});
  final String key, label, ratio, description;
  final int width, height;
  final WebsiteSlotType type;
  double get aspect => width / height;
}

const homeImageSlots = [
  ImageSlot(
      key: 'heroDesktop',
      label: 'Hero 대표 이미지',
      ratio: '16:9',
      width: 1920,
      height: 1080,
      description: 'PC는 16:9 편집본을 사용하고 모바일은 업로드한 원본 비율을 유지합니다.'),
];

final websiteImageSlots = <String, List<ImageSlot>>{
  'home': homeImageSlots,
  'product-overview': const [
    ImageSlot(
        key: 'overview',
        label: '제품 개요 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '제품 개요 영역에 표시되는 대표 이미지'),
    ImageSlot(
        key: 'productOverviewVideo',
        label: '제품 구조 소개영상',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: 'MP4, WEBM 영상 원본 파일',
        type: WebsiteSlotType.video),
    ImageSlot(
        key: 'productOverviewPoster',
        label: '제품 구조 소개영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시할 대표 이미지를 직접 등록하세요.'),
  ],
  'performance-videos': [
    ...List.generate(
        6,
        (i) => [
              ImageSlot(
                  key: 'video${i + 1}File',
                  label: '성능 시연 영상 ${i + 1}',
                  ratio: '16:9',
                  width: 1280,
                  height: 720,
                  description: 'MP4, WEBM 영상 원본 파일',
                  type: WebsiteSlotType.video),
              ImageSlot(
                  key: 'video${i + 1}',
                  label: '성능 시연 영상 ${i + 1} 썸네일',
                  ratio: '16:9',
                  width: 1280,
                  height: 720,
                  description: '영상 재생 전 표시할 대표 이미지를 직접 등록하세요.'),
            ]).expand((slots) => slots),
  ],
  'performance-documents': [
    ...List.generate(4, websiteDocumentSlots).expand((slots) => slots),
  ],
  'product-lineup': const [
    ImageSlot(
        key: 'singleDeck',
        label: '단면형 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '첫 번째 이미지가 제품 대표 이미지로 표시됩니다.'),
    ImageSlot(
        key: 'doubleDeck',
        label: '양면형 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '첫 번째 이미지가 제품 대표 이미지로 표시됩니다.'),
    ImageSlot(
        key: 'threeRunner',
        label: '3열 받침형 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '첫 번째 이미지가 제품 대표 이미지로 표시됩니다.'),
    ImageSlot(
        key: 'custom',
        label: '주문제작형 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '주문제작 제품군 대표 이미지입니다.'),
  ],
  'applications': const [],
  'environment': const [
    ImageSlot(
        key: 'carbonStatement',
        label: '검증 성명서 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '환경 데이터 영역에 표시할 표지 이미지를 직접 등록하세요.'),
  ],
  'company': const [
    ImageSlot(
        key: 'factory',
        label: '공장 전경 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '회사·생산 영역 대표 이미지'),
    ImageSlot(
        key: 'companyOverviewVideo',
        label: '회사·생산 소개영상',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: 'MP4, WEBM 영상 원본 파일',
        type: WebsiteSlotType.video),
    ImageSlot(
        key: 'companyOverviewPoster',
        label: '회사·생산 소개영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시할 대표 이미지를 직접 등록하세요.'),
    ImageSlot(
        key: 'catalogFile',
        label: '제품 카탈로그 PDF',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '홈페이지에서 내려받을 카탈로그 PDF를 등록하세요.',
        type: WebsiteSlotType.pdf),
    ImageSlot(
        key: 'catalogCover',
        label: '제품 카탈로그 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '카탈로그 카드에 표시할 표지 이미지를 직접 등록하세요.'),
  ],
};

String websiteStorageSectionKey(String sectionKey) {
  if (sectionKey.startsWith('performance-')) return 'performance';
  return sectionKey;
}
