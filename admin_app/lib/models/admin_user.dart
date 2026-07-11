class AdminUser {
  const AdminUser({
    required this.username,
    this.displayName,
  });

  final String username;
  final String? displayName;

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      username: json['username'] as String? ?? '',
      displayName: json['displayName'] as String?,
    );
  }
}
