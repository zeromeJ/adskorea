import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/inquiry.dart';
import '../models/admin_user.dart';
import '../screens/activity_log_screen.dart';
import '../screens/admin_create_screen.dart';
import '../screens/admin_list_screen.dart';
import '../screens/inquiry_detail_screen.dart';
import '../services/auth_service.dart';
import '../services/admin_management_service.dart';
import '../services/inquiry_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/inquiry_card.dart';
import '../widgets/loading_view.dart';

class InquiryListScreen extends StatefulWidget {
  const InquiryListScreen({
    required this.authService,
    required this.adminManagementService,
    required this.currentAdmin,
    required this.inquiryService,
    required this.onLogout,
    super.key,
  });

  final AuthService authService;
  final AdminManagementService adminManagementService;
  final AdminUser currentAdmin;
  final InquiryService inquiryService;
  final VoidCallback onLogout;

  @override
  State<InquiryListScreen> createState() => _InquiryListScreenState();
}

class _InquiryListScreenState extends State<InquiryListScreen> {
  String _status = 'ALL';
  bool _isLoading = true;
  String? _error;
  List<Inquiry> _items = [];

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
      final result =
          await widget.inquiryService.fetchInquiries(status: _status);
      final sortedItems = [...result.items]..sort((a, b) {
          final aStatus = a.status == InquiryStatus.pending ? 0 : 1;
          final bStatus = b.status == InquiryStatus.pending ? 0 : 1;
          final statusOrder = aStatus.compareTo(bStatus);
          if (statusOrder != 0) return statusOrder;
          return a.createdAt.compareTo(b.createdAt);
        });
      if (mounted) setState(() => _items = sortedItems);
    } catch (error) {
      setState(() => _error = '문의 목록을 불러오지 못했습니다.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _openPhone(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    await launchUrl(Uri.parse('tel:$phone'));
  }

  Future<void> _markCompleted(Inquiry inquiry) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('처리 완료로 변경할까요?'),
        content: Text(
          '${inquiry.companyName} 문의를 처리 완료 목록으로 이동합니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('처리 완료'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await widget.inquiryService.updateInquiry(
        inquiry.id,
        status: InquiryStatus.completed,
      );
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('처리 완료로 변경했습니다.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('상태를 변경하지 못했습니다. 다시 시도해 주세요.')),
      );
    }
  }

  String get _emptyMessage {
    if (_status == 'PENDING') return '처리 전 문의가 없습니다.';
    if (_status == 'COMPLETED') return '처리 완료된 문의가 없습니다.';
    return '아직 접수된 문의가 없습니다.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(widget.currentAdmin.displayName ?? '관리자'),
                subtitle: Text(
                  widget.currentAdmin.isSuperAdmin
                      ? '${widget.currentAdmin.username} · 최고 관리자'
                      : widget.currentAdmin.username,
                ),
              ),
              const Divider(),
              if (widget.currentAdmin.isSuperAdmin) ...[
                ListTile(
                  leading: const Icon(Icons.person_add_alt_1),
                  title: const Text('신규 관리자 추가'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AdminCreateScreen(
                          service: widget.adminManagementService,
                        ),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.manage_accounts),
                  title: const Text('관리자 목록'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AdminListScreen(
                          service: widget.adminManagementService,
                          currentAdmin: widget.currentAdmin,
                        ),
                      ),
                    );
                  },
                ),
              ],
              ListTile(
                leading: const Icon(Icons.history),
                title: const Text('완료 처리 로그'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ActivityLogScreen(
                        adminService: widget.adminManagementService,
                        inquiryService: widget.inquiryService,
                      ),
                    ),
                  );
                },
              ),
              const Spacer(),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('로그아웃'),
                onTap: () async {
                  Navigator.pop(context);
                  await widget.authService.logout();
                  widget.onLogout();
                },
              ),
            ],
          ),
        ),
      ),
      appBar: AppBar(
        title: const Text('아델슨 문의관리'),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
              child: SizedBox(
                width: double.infinity,
                child: SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'ALL', label: Text('전체 목록')),
                    ButtonSegment(value: 'PENDING', label: Text('처리 전')),
                    ButtonSegment(value: 'COMPLETED', label: Text('처리 완료')),
                  ],
                  showSelectedIcon: false,
                  selected: {_status},
                  onSelectionChanged: (value) {
                    setState(() => _status = value.first);
                    _load();
                  },
                ),
              ),
            ),
            Expanded(
              child: _isLoading
                  ? const LoadingView()
                  : _error != null
                      ? ErrorView(message: _error!, onRetry: _load)
                      : _items.isEmpty
                          ? EmptyState(message: _emptyMessage)
                          : RefreshIndicator(
                              onRefresh: _load,
                              child: ListView.separated(
                                padding:
                                    const EdgeInsets.fromLTRB(12, 4, 12, 24),
                                itemBuilder: (context, index) {
                                  final inquiry = _items[index];
                                  return InquiryCard(
                                    inquiry: inquiry,
                                    onOpen: () async {
                                      await Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => InquiryDetailScreen(
                                            inquiryId: inquiry.id,
                                            inquiryService:
                                                widget.inquiryService,
                                          ),
                                        ),
                                      );
                                      _load();
                                    },
                                    onCall: inquiry.phone?.isNotEmpty == true
                                        ? () => _openPhone(inquiry.phone)
                                        : null,
                                    onComplete:
                                        inquiry.status == InquiryStatus.pending
                                            ? () => _markCompleted(inquiry)
                                            : null,
                                  );
                                },
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemCount: _items.length,
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
