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

const websiteDocumentDefaults = <Map<String, String>>[
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
  },
];

List<ImageSlot> websiteDocumentSlots(int index) => [
      ImageSlot(
          key: 'document${index + 1}File',
          label: '원본 PDF',
          ratio: 'A4 세로형',
          width: 900,
          height: 1273,
          description: '홈페이지에서 내려받을 원본 PDF를 등록하세요.',
          type: WebsiteSlotType.pdf),
      ImageSlot(
          key: 'document${index + 1}TranslatedFile',
          label: '번역본 PDF',
          ratio: 'A4 세로형',
          width: 900,
          height: 1273,
          description: '번역본이 있을 때만 등록하세요.',
          type: WebsiteSlotType.pdf),
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
      description: '한 장만 등록하면 PC 16:9와 모바일 4:5 이미지가 자동으로 생성됩니다.'),
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
    ImageSlot(
        key: 'processVideo',
        label: '제조공정 영상',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: 'MP4, WEBM 영상 원본 파일',
        type: WebsiteSlotType.video),
    ImageSlot(
        key: 'processPoster',
        label: '제조공정 영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시할 대표 이미지를 직접 등록하세요.'),
  ],
  'performance-verification': const [
    ImageSlot(
        key: 'verification',
        label: '성능 시험 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '성능 검증 영역에 표시되는 대표 이미지'),
    ImageSlot(
        key: 'verificationReportFile',
        label: '시험성적서 PDF',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '홈페이지에서 열어볼 시험성적서 PDF를 등록하세요.',
        type: WebsiteSlotType.pdf),
    ImageSlot(
        key: 'verificationReport',
        label: '시험성적서 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '시험성적서 옆에 표시할 표지 이미지를 직접 등록하세요.'),
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
        key: 'carbonStatementFile',
        label: '탄소발자국 검증 성명서 PDF',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '홈페이지에서 열어볼 검증 성명서 PDF를 등록하세요.',
        type: WebsiteSlotType.pdf),
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
