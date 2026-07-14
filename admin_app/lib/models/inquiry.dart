enum InquiryStatus { pending, completed }

class InquiryAttachment {
  const InquiryAttachment({
    required this.id,
    required this.fileName,
    required this.contentType,
    required this.size,
    this.downloadUrl,
  });

  final String id;
  final String fileName;
  final String contentType;
  final int size;
  final String? downloadUrl;

  factory InquiryAttachment.fromJson(Map<String, dynamic> json) {
    return InquiryAttachment(
      id: json['id'] as String? ?? '',
      fileName: json['fileName'] as String? ?? '',
      contentType: json['contentType'] as String? ?? '',
      size: json['size'] as int? ?? 0,
      downloadUrl: json['downloadUrl'] as String?,
    );
  }
}

InquiryStatus inquiryStatusFromJson(String? value) {
  return value == 'COMPLETED' ? InquiryStatus.completed : InquiryStatus.pending;
}

String inquiryStatusToApi(InquiryStatus status) {
  return status == InquiryStatus.completed ? 'COMPLETED' : 'PENDING';
}

String inquiryStatusLabel(InquiryStatus status) {
  return status == InquiryStatus.completed ? '처리 완료' : '처리 전';
}

String inquiryTypeLabel(String? value) {
  switch (value) {
    case 'product':
      return '제품 정보 문의';
    case 'quote':
      return '견적 요청';
    case 'consulting':
      return '적용·주문제작 상담';
    case 'other':
      return '자료·기타 문의';
    default:
      return value ?? '';
  }
}

class Inquiry {
  const Inquiry({
    required this.id,
    required this.companyName,
    required this.contactPerson,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.email,
    this.phone,
    this.responseMethod,
    this.inquiryType,
    this.department,
    this.inquiryDetails = const {},
    this.country,
    this.industry,
    this.currentPalletType,
    this.productInterest,
    this.cargoType,
    this.loadPerPallet,
    this.estimatedQuantity,
    this.requiredPalletSize,
    this.exportCountry,
    this.rackStorage,
    this.automationUse,
    this.forkliftUse,
    this.handPalletTruckUse,
    this.message,
    this.adminMemo,
    this.attachments = const [],
  });

  final String id;
  final String companyName;
  final String contactPerson;
  final String? email;
  final String? phone;
  final String? responseMethod;
  final String? inquiryType;
  final String? department;
  final Map<String, dynamic> inquiryDetails;
  final String? country;
  final String? industry;
  final String? currentPalletType;
  final String? productInterest;
  final String? cargoType;
  final String? loadPerPallet;
  final String? estimatedQuantity;
  final String? requiredPalletSize;
  final String? exportCountry;
  final bool? rackStorage;
  final bool? automationUse;
  final bool? forkliftUse;
  final bool? handPalletTruckUse;
  final String? message;
  final InquiryStatus status;
  final String? adminMemo;
  final List<InquiryAttachment> attachments;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory Inquiry.fromJson(Map<String, dynamic> json) {
    return Inquiry(
      id: json['id'] as String? ?? '',
      companyName: json['companyName'] as String? ?? '',
      contactPerson: json['contactPerson'] as String? ?? '',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      responseMethod: json['responseMethod'] as String?,
      inquiryType: json['inquiryType'] as String?,
      department: json['department'] as String?,
      inquiryDetails: json['inquiryDetails'] is Map
          ? Map<String, dynamic>.from(json['inquiryDetails'] as Map)
          : const {},
      country: json['country'] as String?,
      industry: json['industry'] as String?,
      currentPalletType: json['currentPalletType'] as String?,
      productInterest: json['productInterest'] as String?,
      cargoType: json['cargoType'] as String?,
      loadPerPallet: json['loadPerPallet'] as String?,
      estimatedQuantity: json['estimatedQuantity'] as String?,
      requiredPalletSize: json['requiredPalletSize'] as String?,
      exportCountry: json['exportCountry'] as String?,
      rackStorage: json['rackStorage'] as bool?,
      automationUse: json['automationUse'] as bool?,
      forkliftUse: json['forkliftUse'] as bool?,
      handPalletTruckUse: json['handPalletTruckUse'] as bool?,
      message: json['message'] as String?,
      status: inquiryStatusFromJson(json['status'] as String?),
      adminMemo: json['adminMemo'] as String?,
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(InquiryAttachment.fromJson)
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}
