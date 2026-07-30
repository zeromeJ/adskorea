class AdminUser {
  const AdminUser({
    required this.id,
    required this.username,
    this.displayName,
    this.isSuperAdmin = false,
    this.isAssistantAdmin = false,
    this.isActive = true,
    this.pendingInquiryCount = 0,
    this.staleThreeDayCount = 0,
    this.createdAt,
  });

  final String id;
  final String username;
  final String? displayName;
  final bool isSuperAdmin;
  final bool isAssistantAdmin;
  final bool isActive;
  final int pendingInquiryCount;
  final int staleThreeDayCount;
  final DateTime? createdAt;

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'] as String? ?? '',
      username: json['username'] as String? ?? '',
      displayName: json['displayName'] as String?,
      isSuperAdmin: json['isSuperAdmin'] as bool? ?? false,
      isAssistantAdmin: json['isAssistantAdmin'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      pendingInquiryCount: (json['pendingInquiryCount'] as num?)?.toInt() ?? 0,
      staleThreeDayCount: (json['staleThreeDayCount'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );
  }

  String get displayLabel =>
      displayName?.trim().isNotEmpty == true ? displayName!.trim() : '표시 이름 없음';

  bool get canManageInquiries => isSuperAdmin || isAssistantAdmin;

  bool get canManageWebsite => isSuperAdmin || isAssistantAdmin;
}
