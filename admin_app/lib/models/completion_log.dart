class CompletionLog {
  const CompletionLog({
    required this.id,
    required this.inquiryId,
    required this.companyName,
    required this.contactPerson,
    required this.adminUsername,
    required this.completedAt,
    this.adminDisplayName,
  });

  final String id;
  final String inquiryId;
  final String companyName;
  final String contactPerson;
  final String adminUsername;
  final String? adminDisplayName;
  final DateTime completedAt;

  factory CompletionLog.fromJson(Map<String, dynamic> json) {
    final inquiry = json['inquiry'] as Map<String, dynamic>? ?? {};
    return CompletionLog(
      id: json['id'] as String? ?? '',
      inquiryId: inquiry['id'] as String? ?? '',
      companyName: inquiry['companyName'] as String? ?? '',
      contactPerson: inquiry['contactPerson'] as String? ?? '',
      adminUsername: json['adminUsername'] as String? ?? '',
      adminDisplayName: json['adminDisplayName'] as String?,
      completedAt: DateTime.parse(json['completedAt'] as String),
    );
  }
}
