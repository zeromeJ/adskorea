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

class ImageSlot {
  const ImageSlot(
      {required this.key,
      required this.label,
      required this.ratio,
      required this.width,
      required this.height,
      required this.description});
  final String key, label, ratio, description;
  final int width, height;
  double get aspect => width / height;
}

const mainImageSlots = [
  ImageSlot(
      key: 'heroDesktop',
      label: 'Hero 데스크톱 이미지',
      ratio: '16:9',
      width: 1920,
      height: 1080,
      description: '홈페이지 첫 화면의 데스크톱 대표 이미지'),
  ImageSlot(
      key: 'heroMobile',
      label: 'Hero 모바일 이미지',
      ratio: '4:5',
      width: 1080,
      height: 1350,
      description: '모바일 첫 화면의 대표 이미지'),
  ImageSlot(
      key: 'overview',
      label: '제품 개요 이미지',
      ratio: '4:3',
      width: 1200,
      height: 900,
      description: '제품 소개 영역에 표시되는 이미지'),
  ImageSlot(
      key: 'verification',
      label: '성능 시험 대표 이미지',
      ratio: '4:3',
      width: 1200,
      height: 900,
      description: '성능 시험 영역에 표시되는 이미지'),
  ImageSlot(
      key: 'verificationReport',
      label: '시험성적서 대표 썸네일',
      ratio: 'A4 세로형',
      width: 900,
      height: 1273,
      description: '시험성적서 미리보기 이미지'),
  ImageSlot(
      key: 'carbonStatement',
      label: '탄소발자국 검증 성명서 썸네일',
      ratio: 'A4 세로형',
      width: 900,
      height: 1273,
      description: '환경 데이터 검증서 미리보기 이미지'),
];

final websiteImageSlots = <String, List<ImageSlot>>{
  'main-images': mainImageSlots,
  'product-images': const [
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
  'intro-videos': const [
    ImageSlot(
        key: 'productOverviewPoster',
        label: '제품 구조 소개영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시되는 이미지'),
    ImageSlot(
        key: 'companyOverviewPoster',
        label: '회사·생산 소개영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시되는 이미지'),
    ImageSlot(
        key: 'processPoster',
        label: '제조공정 영상 썸네일',
        ratio: '16:9',
        width: 1280,
        height: 720,
        description: '영상 재생 전 표시되는 이미지'),
  ],
  'performance-tests': const [
    ImageSlot(
        key: 'national2025',
        label: '2025 성능 시험 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: 'PDF 옆에 표시되는 대표 이미지'),
    ImageSlot(
        key: 'tbkPhysical2026',
        label: '2026 TBK 물리성능 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: 'PDF 옆에 표시되는 대표 이미지'),
    ImageSlot(
        key: 'tbkFormaldehyde2026',
        label: '2026 TBK 포름알데히드 썸네일',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: 'PDF 옆에 표시되는 대표 이미지'),
  ],
  'performance-videos': List.generate(
      6,
      (i) => ImageSlot(
          key: 'video${i + 1}',
          label: '성능 시연 영상 ${i + 1} 썸네일',
          ratio: '16:9',
          width: 1280,
          height: 720,
          description: '영상 URL과 함께 표시되는 썸네일')),
  'documents': List.generate(
      4,
      (i) => ImageSlot(
          key: 'document${i + 1}',
          label: '기술자료 ${i + 1} 썸네일',
          ratio: 'A4 세로형',
          width: 900,
          height: 1273,
          description: 'PDF 문서 카드의 대표 이미지')),
  'catalog': const [
    ImageSlot(
        key: 'catalogCover',
        label: '카탈로그 표지',
        ratio: 'A4 세로형',
        width: 900,
        height: 1273,
        description: '카탈로그 다운로드 카드 표지')
  ],
  'company': const [
    ImageSlot(
        key: 'factory',
        label: '공장 전경 대표 이미지',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '회사·생산 영역 대표 이미지')
  ],
  'site-settings': const [
    ImageSlot(
        key: 'logo',
        label: '홈페이지 로고',
        ratio: '4:3',
        width: 1200,
        height: 900,
        description: '투명 여백을 포함해 로고 전체가 보이도록 조정하세요.')
  ],
};
