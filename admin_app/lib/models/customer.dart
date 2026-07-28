enum CustomerInquiryStatus { pending, completed }

class CustomerCompany {
  const CustomerCompany({required this.id, required this.name});

  final String id;
  final String name;

  factory CustomerCompany.fromJson(Map<String, dynamic> json) {
    return CustomerCompany(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
    );
  }
}

class CustomerInquirySummary {
  const CustomerInquirySummary({
    required this.id,
    required this.registrationNumber,
    required this.status,
    required this.createdAt,
    this.inquiryType,
    this.assignedAdminDisplayName,
  });

  final String id;
  final String registrationNumber;
  final CustomerInquiryStatus status;
  final String? inquiryType;
  final String? assignedAdminDisplayName;
  final DateTime createdAt;

  factory CustomerInquirySummary.fromJson(Map<String, dynamic> json) {
    final assignedAdmin = json['assignedAdmin'] is Map
        ? Map<String, dynamic>.from(json['assignedAdmin'] as Map)
        : const <String, dynamic>{};
    return CustomerInquirySummary(
      id: json['id'] as String? ?? '',
      registrationNumber: json['registrationNumber'] as String? ?? '',
      status: json['status'] == 'COMPLETED'
          ? CustomerInquiryStatus.completed
          : CustomerInquiryStatus.pending,
      inquiryType: json['inquiryType'] as String?,
      assignedAdminDisplayName: assignedAdmin['displayName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class CustomerDuplicateCandidate {
  const CustomerDuplicateCandidate({
    required this.reviewId,
    required this.customer,
    required this.matchedPhone,
    required this.matchedEmail,
    required this.matchedCompany,
  });

  final String reviewId;
  final Customer customer;
  final bool matchedPhone;
  final bool matchedEmail;
  final bool matchedCompany;

  factory CustomerDuplicateCandidate.fromJson(Map<String, dynamic> json) {
    return CustomerDuplicateCandidate(
      reviewId: json['id'] as String? ?? '',
      customer: Customer.fromJson(
        json['candidateCustomer'] as Map<String, dynamic>? ?? {},
      ),
      matchedPhone: json['matchedPhone'] as bool? ?? false,
      matchedEmail: json['matchedEmail'] as bool? ?? false,
      matchedCompany: json['matchedCompany'] as bool? ?? false,
    );
  }

  String get reasonLabel {
    final reasons = <String>[
      if (matchedPhone) '전화번호 일치',
      if (matchedEmail) '이메일 일치',
      if (matchedCompany) '회사명 일치',
    ];
    return reasons.join(' · ');
  }
}

class Customer {
  const Customer({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.memo,
    this.company,
    this.isFavorite = false,
    this.hasPendingDuplicate = false,
    this.inquiryCount = 0,
    this.inquiries = const [],
    this.duplicateCandidates = const [],
    this.createdAt,
  });

  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? memo;
  final CustomerCompany? company;
  final bool isFavorite;
  final bool hasPendingDuplicate;
  final int inquiryCount;
  final List<CustomerInquirySummary> inquiries;
  final List<CustomerDuplicateCandidate> duplicateCandidates;
  final DateTime? createdAt;

  factory Customer.fromJson(Map<String, dynamic> json) {
    final companyJson = json['company'] as Map<String, dynamic>?;
    final inquiries = (json['inquiries'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(CustomerInquirySummary.fromJson)
        .toList();
    return Customer(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      memo: json['memo'] as String?,
      company:
          companyJson == null ? null : CustomerCompany.fromJson(companyJson),
      isFavorite: json['isFavorite'] as bool? ?? false,
      hasPendingDuplicate: json['hasPendingDuplicate'] as bool? ?? false,
      inquiryCount: json['inquiryCount'] as int? ?? inquiries.length,
      inquiries: inquiries,
      duplicateCandidates:
          (json['duplicateReviews'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(CustomerDuplicateCandidate.fromJson)
              .toList(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );
  }

  String get nameLabel => name.trim().isEmpty ? '고객명 미입력' : name;
  String get companyNameLabel =>
      company?.name.trim().isNotEmpty == true ? company!.name : '회사명 미입력';
}

class CompanyContact {
  const CompanyContact({
    required this.id,
    required this.name,
    required this.inquiries,
    this.phone,
    this.email,
  });

  final String id;
  final String name;
  final String? phone;
  final String? email;
  final List<CustomerInquirySummary> inquiries;

  factory CompanyContact.fromJson(Map<String, dynamic> json) {
    return CompanyContact(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      inquiries: (json['inquiries'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CustomerInquirySummary.fromJson)
          .toList(),
    );
  }

  String get nameLabel => name.trim().isEmpty ? '담당자명 미입력' : name;
}

class CompanyDetail {
  const CompanyDetail({
    required this.id,
    required this.name,
    required this.customers,
    this.memo,
  });

  final String id;
  final String name;
  final String? memo;
  final List<CompanyContact> customers;

  factory CompanyDetail.fromJson(Map<String, dynamic> json) {
    return CompanyDetail(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      memo: json['memo'] as String?,
      customers: (json['customers'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CompanyContact.fromJson)
          .toList(),
    );
  }
}
