import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/push_notification_service.dart';
import 'onboarding_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({
    required this.pushNotificationService,
    super.key,
  });

  static const appVersion = '1.0.20 (46)';
  static const contactEmail = 'bossjhb@naver.com';

  final PushNotificationService pushNotificationService;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool? _notificationsEnabled;
  bool _changingNotifications = false;

  @override
  void initState() {
    super.initState();
    _loadNotificationSetting();
  }

  Future<void> _loadNotificationSetting() async {
    final enabled = await widget.pushNotificationService.notificationsEnabled();
    if (mounted) setState(() => _notificationsEnabled = enabled);
  }

  Future<void> _changeNotifications(bool enabled) async {
    if (_changingNotifications) return;
    setState(() => _changingNotifications = true);
    final changed =
        await widget.pushNotificationService.setNotificationsEnabled(enabled);
    if (!mounted) return;
    setState(() {
      _notificationsEnabled = enabled && changed;
      _changingNotifications = false;
    });
    if (enabled && !changed) {
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('알림을 켤 수 없습니다.'),
          content: const Text('기기 설정에서 아델슨 관리자 앱의 알림을 허용해 주세요.'),
          actions: [
            FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('확인'),
            ),
          ],
        ),
      );
    }
  }

  Future<void> _sendErrorReport() async {
    await launchUrl(
      Uri(
        scheme: 'mailto',
        path: SettingsScreen.contactEmail,
        queryParameters: {
          'subject': '[아델슨 관리자 앱] 오류 신고',
          'body':
              '앱 버전: ${SettingsScreen.appVersion}\n\n오류가 발생한 화면과 상황을 적어 주세요.\n',
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('설정')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            elevation: 0,
            child: SwitchListTile(
              minTileHeight: 72,
              secondary: const Icon(Icons.notifications_outlined, size: 28),
              title: const Text(
                '문의 알림',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              subtitle: Text(
                _notificationsEnabled == true
                    ? '새 문의와 담당 배정 알림을 받습니다.'
                    : '알림을 받지 않습니다.',
              ),
              value: _notificationsEnabled ?? false,
              onChanged: _notificationsEnabled == null || _changingNotifications
                  ? null
                  : _changeNotifications,
            ),
          ),
          _tile(
            context,
            icon: Icons.help_outline,
            title: '사용법 보기',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const OnboardingScreen()),
            ),
          ),
          _tile(
            context,
            icon: Icons.info_outline,
            title: '앱 버전',
            subtitle: SettingsScreen.appVersion,
          ),
          _tile(
            context,
            icon: Icons.mail_outline,
            title: '문의 연락처',
            subtitle: SettingsScreen.contactEmail,
            onTap: () => launchUrl(
              Uri(scheme: 'mailto', path: SettingsScreen.contactEmail),
            ),
          ),
          _tile(
            context,
            icon: Icons.report_problem_outlined,
            title: '오류 신고',
            subtitle: '메일로 오류 상황을 보냅니다.',
            onTap: _sendErrorReport,
          ),
        ],
      ),
    );
  }

  Widget _tile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    VoidCallback? onTap,
  }) {
    return Card(
      elevation: 0,
      child: ListTile(
        minTileHeight: 64,
        leading: Icon(icon, size: 28),
        title: Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
        subtitle: subtitle == null ? null : Text(subtitle),
        trailing: onTap == null ? null : const Text('열기'),
        onTap: onTap,
      ),
    );
  }
}
