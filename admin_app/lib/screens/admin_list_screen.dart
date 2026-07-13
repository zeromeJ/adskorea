import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/admin_user.dart';
import '../services/admin_management_service.dart';
import '../services/api_client.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_view.dart';
import 'admin_create_screen.dart';

class AdminListScreen extends StatefulWidget {
  const AdminListScreen({
    required this.service,
    required this.currentAdmin,
    super.key,
  });

  final AdminManagementService service;
  final AdminUser currentAdmin;

  @override
  State<AdminListScreen> createState() => _AdminListScreenState();
}

class _AdminListScreenState extends State<AdminListScreen> {
  bool _isLoading = true;
  String? _error;
  List<AdminUser> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final items = await widget.service.fetchAdmins();
      if (mounted) setState(() => _items = items);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _openCreate() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AdminCreateScreen(service: widget.service),
      ),
    );
    if (created == true) _load();
  }

  Future<void> _resetPassword(AdminUser admin) async {
    final controller = TextEditingController();
    var obscurePassword = true;
    final password = await showDialog<String>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('${admin.username} 비밀번호 재설정'),
          content: TextField(
            controller: controller,
            autofocus: true,
            obscureText: obscurePassword,
            decoration: InputDecoration(
              labelText: '새 비밀번호',
              helperText: '8자 이상',
              suffixIcon: IconButton(
                tooltip: obscurePassword ? '비밀번호 보기' : '비밀번호 숨기기',
                onPressed: () => setDialogState(
                  () => obscurePassword = !obscurePassword,
                ),
                icon: Icon(
                  obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('변경'),
            ),
          ],
        ),
      ),
    );
    controller.dispose();
    if (password == null) return;

    try {
      await widget.service.resetPassword(admin.id, password);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('비밀번호가 재설정되었습니다.')),
      );
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    }
  }

  Future<void> _delete(AdminUser admin) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('관리자 삭제'),
        content: Text('${admin.username} 계정을 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('삭제'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await widget.service.deleteAdmin(admin.id);
      await _load();
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('관리자 목록'),
        actions: [
          IconButton(
              onPressed: _openCreate, icon: const Icon(Icons.person_add)),
        ],
      ),
      body: SafeArea(
        top: false,
        child: _isLoading
            ? const LoadingView()
            : _error != null
                ? ErrorView(message: _error!, onRetry: _load)
                : _items.isEmpty
                    ? const EmptyState(message: '등록된 관리자가 없습니다.')
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final admin = _items[index];
                            final canDelete = !admin.isSuperAdmin &&
                                admin.id != widget.currentAdmin.id;
                            return Card(
                              elevation: 0,
                              child: ListTile(
                                title: Row(
                                  children: [
                                    Expanded(child: Text(admin.username)),
                                    if (admin.isSuperAdmin)
                                      const Chip(label: Text('최고 관리자')),
                                  ],
                                ),
                                subtitle: Text(
                                  '${admin.displayName ?? "이름 없음"}\n등록 ${admin.createdAt == null ? "-" : DateFormat("yyyy.MM.dd").format(admin.createdAt!.toLocal())}',
                                ),
                                isThreeLine: true,
                                trailing: PopupMenuButton<String>(
                                  onSelected: (value) {
                                    if (value == 'reset') _resetPassword(admin);
                                    if (value == 'delete') _delete(admin);
                                  },
                                  itemBuilder: (_) => [
                                    const PopupMenuItem(
                                      value: 'reset',
                                      child: Text('비밀번호 재설정'),
                                    ),
                                    if (canDelete)
                                      const PopupMenuItem(
                                        value: 'delete',
                                        child: Text('삭제'),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
