import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../models/admin_user.dart';
import '../screens/activity_log_screen.dart';
import '../screens/admin_list_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/website_management_screen.dart';
import '../services/admin_management_service.dart';
import '../services/auth_service.dart';
import '../services/customer_service.dart';
import '../services/inquiry_service.dart';
import '../services/push_notification_service.dart';
import '../services/website_content_service.dart';

class AdminMenuDrawer extends StatelessWidget {
  const AdminMenuDrawer({
    required this.currentAdmin,
    required this.authService,
    required this.adminManagementService,
    required this.customerService,
    required this.inquiryService,
    required this.pushNotificationService,
    required this.websiteContentService,
    required this.onLogout,
    super.key,
  });

  final AdminUser currentAdmin;
  final AuthService authService;
  final AdminManagementService adminManagementService;
  final CustomerService customerService;
  final InquiryService inquiryService;
  final PushNotificationService pushNotificationService;
  final WebsiteContentService websiteContentService;
  final VoidCallback onLogout;

  void _open(BuildContext context, Widget screen) {
    final navigator = Navigator.of(context);
    navigator.pop();
    navigator.push(MaterialPageRoute(builder: (_) => screen));
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('로그아웃하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await authService.logout();
    onLogout();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    currentAdmin.displayLabel,
                    style: const TextStyle(
                      fontSize: 21,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('로그인 ID  ${currentAdmin.username}'),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  if (currentAdmin.isSuperAdmin) ...[
                    _group('운영'),
                    _tile(
                      icon: Icons.manage_accounts_outlined,
                      title: '관리자',
                      onTap: () => _open(
                        context,
                        AdminListScreen(
                          service: adminManagementService,
                          currentAdmin: currentAdmin,
                        ),
                      ),
                    ),
                  ],
                  if (currentAdmin.canManageWebsite) ...[
                    if (!currentAdmin.isSuperAdmin) _group('운영'),
                    _tile(
                      icon: Icons.web_outlined,
                      title: '홈페이지',
                      onTap: () => _open(
                        context,
                        WebsiteManagementScreen(
                          service: websiteContentService,
                        ),
                      ),
                    ),
                  ],
                  if (currentAdmin.isSuperAdmin) ...[
                    _group('기록'),
                    _tile(
                      icon: Icons.history,
                      title: '처리 기록',
                      onTap: () => _open(
                        context,
                        ActivityLogScreen(
                          adminService: adminManagementService,
                          currentAdmin: currentAdmin,
                          inquiryService: inquiryService,
                          customerService: customerService,
                        ),
                      ),
                    ),
                  ],
                  _group('기타'),
                  _tile(
                    icon: Icons.settings_outlined,
                    title: '설정',
                    onTap: () => _open(
                      context,
                      SettingsScreen(
                        pushNotificationService: pushNotificationService,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            _tile(
              icon: Icons.logout,
              title: '로그아웃',
              onTap: () => _confirmLogout(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _group(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.subText,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _tile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      minTileHeight: 58,
      leading: Icon(icon, size: 27),
      title: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
      ),
      onTap: onTap,
    );
  }
}
