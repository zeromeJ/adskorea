import '../models/admin_user.dart';
import '../models/completion_log.dart';
import 'api_client.dart';

class AdminManagementService {
  AdminManagementService(this.client);

  final ApiClient client;

  Future<List<AdminUser>> fetchAdmins() async {
    final json = await client.get('/api/admin/admins');
    return (json['items'] as List<dynamic>)
        .map((item) => AdminUser.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> createAdmin({
    required String username,
    required String password,
    required String displayName,
  }) async {
    await client.post('/api/admin/admins', {
      'username': username,
      'password': password,
      'displayName': displayName,
    });
  }

  Future<void> resetPassword(String id, String password) async {
    await client.patch('/api/admin/admins/$id', {'password': password});
  }

  Future<void> deleteAdmin(String id) async {
    await client.delete('/api/admin/admins/$id');
  }

  Future<List<CompletionLog>> fetchCompletionLogs() async {
    final json = await client.get('/api/admin/activity-logs', {
      'limit': '100',
    });
    return (json['items'] as List<dynamic>)
        .map((item) => CompletionLog.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
