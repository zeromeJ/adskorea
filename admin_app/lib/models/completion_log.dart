enum InquiryActivityType { completed, assigned, unassigned }

class InquiryActivityLog {
  const InquiryActivityLog({
    required this.id,
    required this.type,
    required this.inquiryId,
    required this.registrationNumber,
    required this.companyName,
    required this.contactPerson,
    required this.adminUsername,
    required this.occurredAt,
    this.adminDisplayName,
    this.assignedAdminId,
    this.assignedAdminDisplayName,
  });

  final String id;
  final InquiryActivityType type;
  final String inquiryId;
  final String registrationNumber;
  final String companyName;
  final String contactPerson;
  final String adminUsername;
  final String? adminDisplayName;
  final String? assignedAdminId;
  final String? assignedAdminDisplayName;
  final DateTime occurredAt;

  factory InquiryActivityLog.fromJson(Map<String, dynamic> json) {
    final inquiry = json['inquiry'] as Map<String, dynamic>? ?? {};
    final type = switch (json['type']) {
      'ASSIGNED' => InquiryActivityType.assigned,
      'UNASSIGNED' => InquiryActivityType.unassigned,
      _ => InquiryActivityType.completed,
    };
    return InquiryActivityLog(
      id: json['id'] as String? ?? '',
      type: type,
      inquiryId: inquiry['id'] as String? ?? '',
      registrationNumber: inquiry['registrationNumber'] as String? ?? '',
      companyName: inquiry['companyName'] as String? ?? '',
      contactPerson: inquiry['contactPerson'] as String? ?? '',
      adminUsername: json['adminUsername'] as String? ?? '',
      adminDisplayName: json['adminDisplayName'] as String?,
      assignedAdminId: json['assignedAdminId'] as String?,
      assignedAdminDisplayName: json['assignedAdminDisplayName'] as String?,
      occurredAt: DateTime.parse(json['occurredAt'] as String),
    );
  }

  String get adminLabel => adminDisplayName?.trim().isNotEmpty == true
      ? adminDisplayName!.trim()
      : adminUsername;

  String get assignedAdminLabel =>
      assignedAdminDisplayName?.trim().isNotEmpty == true
          ? assignedAdminDisplayName!.trim()
          : '표시 이름 없음';

  String get contactPersonLabel =>
      contactPerson.trim().isEmpty ? '담당자명 미입력' : contactPerson;
}
