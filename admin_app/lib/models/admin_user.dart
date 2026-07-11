class AdminUser {
  const AdminUser({
    required this.id,
    required this.username,
    this.displayName,
    this.isSuperAdmin = false,
    this.isActive = true,
    this.createdAt,
  });

  final String id;
  final String username;
  final String? displayName;
  final bool isSuperAdmin;
  final bool isActive;
  final DateTime? createdAt;

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'] as String? ?? '',
      username: json['username'] as String? ?? '',
      displayName: json['displayName'] as String?,
      isSuperAdmin: json['isSuperAdmin'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );
  }
}
