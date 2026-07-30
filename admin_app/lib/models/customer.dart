enum CustomerInquiryStatus { pending, completed }

class CustomerCompany {
  const CustomerCompany({
    required this.id,
    required this.name,
    this.customerCount = 0,
  });

  final String id;
  final String name;
  final int customerCount;

  factory CustomerCompany.fromJson(Map<String, dynamic> json) {
    return CustomerCompany(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      customerCount: (json['customerCount'] as num?)?.toInt() ?? 0,
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

class CustomerMergeHistory {
  const CustomerMergeHistory({
    required this.id,
    required this.sourceCustomer,
    required this.movedInquiries,
    required this.mergedByLabel,
    required this.createdAt,
    this.undoneAt,
    this.undoneByDisplayName,
  });

  final String id;
  final Customer sourceCustomer;
  final List<CustomerInquirySummary> movedInquiries;
  final String mergedByLabel;
  final DateTime createdAt;
  final DateTime? undoneAt;
  final String? undoneByDisplayName;

  bool get isUndone => undoneAt != null;

  factory CustomerMergeHistory.fromJson(Map<String, dynamic> json) {
    final rawMovedInquiries =
        json['movedInquiries'] as List<dynamic>? ?? const [];
    final movedInquiries = rawMovedInquiries
        .whereType<Map<String, dynamic>>()
        .map((record) => record['inquiry'])
        .whereType<Map<String, dynamic>>()
        .map(CustomerInquirySummary.fromJson)
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final displayName = (json['mergedByDisplayName'] as String? ?? '').trim();
    final username = (json['mergedByUsername'] as String? ?? '').trim();
    return CustomerMergeHistory(
      id: json['id'] as String? ?? '',
      sourceCustomer: Customer.fromJson(
        json['sourceCustomer'] as Map<String, dynamic>? ?? {},
      ),
      movedInquiries: movedInquiries,
      mergedByLabel: displayName.isNotEmpty
          ? displayName
          : (username.isNotEmpty ? username : '관리자'),
      createdAt: DateTime.parse(json['createdAt'] as String),
      undoneAt: json['undoneAt'] == null
          ? null
          : DateTime.parse(json['undoneAt'] as String),
      undoneByDisplayName: json['undoneByDisplayName'] as String?,
    );
  }
}

class Customer {
  const Customer({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.memo,
    this.privateMemo,
    this.company,
    this.isFavorite = false,
    this.hasPendingDuplicate = false,
    this.inquiryCount = 0,
    this.pendingInquiryCount = 0,
    this.hasStaleInquiry = false,
    this.inquiries = const [],
    this.duplicateCandidates = const [],
    this.mergeHistory = const [],
    this.createdAt,
    this.recentInquiryAt,
    this.companyChangeLogs = const [],
  });

  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? memo;
  final String? privateMemo;
  final CustomerCompany? company;
  final bool isFavorite;
  final bool hasPendingDuplicate;
  final int inquiryCount;
  final int pendingInquiryCount;
  final bool hasStaleInquiry;
  final List<CustomerInquirySummary> inquiries;
  final List<CustomerDuplicateCandidate> duplicateCandidates;
  final List<CustomerMergeHistory> mergeHistory;
  final DateTime? createdAt;
  final DateTime? recentInquiryAt;
  final List<CompanyChangeLog> companyChangeLogs;

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
      privateMemo: json['privateMemo'] as String?,
      company:
          companyJson == null ? null : CustomerCompany.fromJson(companyJson),
      isFavorite: json['isFavorite'] as bool? ?? false,
      hasPendingDuplicate: json['hasPendingDuplicate'] as bool? ?? false,
      inquiryCount: json['inquiryCount'] as int? ?? inquiries.length,
      pendingInquiryCount: (json['pendingInquiryCount'] as num?)?.toInt() ??
          inquiries
              .where(
                (item) => item.status == CustomerInquiryStatus.pending,
              )
              .length,
      hasStaleInquiry: json['hasStaleInquiry'] as bool? ?? false,
      inquiries: inquiries,
      duplicateCandidates:
          (json['duplicateReviews'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(CustomerDuplicateCandidate.fromJson)
              .toList(),
      mergeHistory: (json['mergeLogsAsTarget'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CustomerMergeHistory.fromJson)
          .toList(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      recentInquiryAt: json['recentInquiryAt'] == null
          ? null
          : DateTime.parse(json['recentInquiryAt'] as String),
      companyChangeLogs:
          (json['companyChangeLogs'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(CompanyChangeLog.fromJson)
              .toList(),
    );
  }

  String get nameLabel => name.trim().isEmpty ? '고객명 미입력' : name;
  String get companyNameLabel =>
      company?.name.trim().isNotEmpty == true ? company!.name : '회사명 미입력';
}

class CompanyChangeLog {
  const CompanyChangeLog({
    required this.id,
    required this.adminLabel,
    required this.createdAt,
    this.previousCompanyName,
    this.newCompanyName,
  });

  final String id;
  final String? previousCompanyName;
  final String? newCompanyName;
  final String adminLabel;
  final DateTime createdAt;

  factory CompanyChangeLog.fromJson(Map<String, dynamic> json) {
    final displayName = (json['adminDisplayName'] as String? ?? '').trim();
    final username = (json['adminUsername'] as String? ?? '').trim();
    return CompanyChangeLog(
      id: json['id'] as String? ?? '',
      previousCompanyName: json['previousCompanyName'] as String?,
      newCompanyName: json['newCompanyName'] as String?,
      adminLabel: displayName.isNotEmpty
          ? displayName
          : (username.isNotEmpty ? username : '관리자'),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
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
    this.privateMemo,
  });

  final String id;
  final String name;
  final String? memo;
  final String? privateMemo;
  final List<CompanyContact> customers;

  factory CompanyDetail.fromJson(Map<String, dynamic> json) {
    return CompanyDetail(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      memo: json['memo'] as String?,
      privateMemo: json['privateMemo'] as String?,
      customers: (json['customers'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CompanyContact.fromJson)
          .toList(),
    );
  }
}
