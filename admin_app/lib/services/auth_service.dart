import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/admin_user.dart';
import 'api_client.dart';

class AuthService {
  AuthService(this.client);

  final ApiClient client;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const _tokenKey = 'admin_token';

  Future<String?> loadToken() async {
    final token = await _storage.read(key: _tokenKey);
    client.token = token;
    return token;
  }

  Future<AdminUser> login(String username, String password) async {
    // TODO: Change default admin password before production.
    // TODO: Add password change screen later if needed.
    final json = await client.post('/api/admin/login', {
      'username': username,
      'password': password,
    });

    final token = json['token'] as String;
    await _storage.write(key: _tokenKey, value: token);
    client.token = token;

    return AdminUser.fromJson(json['admin'] as Map<String, dynamic>);
  }

  Future<AdminUser?> me() async {
    if (client.token == null || client.token!.isEmpty) return null;

    try {
      final json = await client.get('/api/admin/me');
      return AdminUser.fromJson(json['admin'] as Map<String, dynamic>);
    } on ApiException catch (error) {
      if (error.statusCode == 401) {
        await logout();
      }
      return null;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    client.token = null;
  }
}
