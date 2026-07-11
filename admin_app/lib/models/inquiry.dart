enum InquiryStatus { pending, completed }

InquiryStatus inquiryStatusFromJson(String? value) {
  return value == 'COMPLETED' ? InquiryStatus.completed : InquiryStatus.pending;
}

String inquiryStatusToApi(InquiryStatus status) {
  return status == InquiryStatus.completed ? 'COMPLETED' : 'PENDING';
}

String inquiryStatusLabel(InquiryStatus status) {
  return status == InquiryStatus.completed ? '처리 완료' : '처리 전';
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
    this.country,
    this.industry,
    this.currentPalletType,
    this.productInterest,
    this.estimatedQuantity,
    this.exportCountry,
    this.message,
    this.adminMemo,
  });

  final String id;
  final String companyName;
  final String contactPerson;
  final String? email;
  final String? phone;
  final String? country;
  final String? industry;
  final String? currentPalletType;
  final String? productInterest;
  final String? estimatedQuantity;
  final String? exportCountry;
  final String? message;
  final InquiryStatus status;
  final String? adminMemo;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory Inquiry.fromJson(Map<String, dynamic> json) {
    return Inquiry(
      id: json['id'] as String? ?? '',
      companyName: json['companyName'] as String? ?? '',
      contactPerson: json['contactPerson'] as String? ?? '',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      country: json['country'] as String?,
      industry: json['industry'] as String?,
      currentPalletType: json['currentPalletType'] as String?,
      productInterest: json['productInterest'] as String?,
      estimatedQuantity: json['estimatedQuantity'] as String?,
      exportCountry: json['exportCountry'] as String?,
      message: json['message'] as String?,
      status: inquiryStatusFromJson(json['status'] as String?),
      adminMemo: json['adminMemo'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}
