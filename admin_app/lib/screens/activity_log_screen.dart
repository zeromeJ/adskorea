import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/completion_log.dart';
import '../models/admin_user.dart';
import '../services/admin_management_service.dart';
import '../services/api_client.dart';
import '../services/inquiry_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_view.dart';
import 'inquiry_detail_screen.dart';

class ActivityLogScreen extends StatefulWidget {
  const ActivityLogScreen({
    required this.adminService,
    required this.currentAdmin,
    required this.inquiryService,
    super.key,
  });

  final AdminManagementService adminService;
  final AdminUser currentAdmin;
  final InquiryService inquiryService;

  @override
  State<ActivityLogScreen> createState() => _ActivityLogScreenState();
}

class _ActivityLogScreenState extends State<ActivityLogScreen> {
  bool _isLoading = true;
  String? _error;
  String _type = 'ALL';
  List<InquiryActivityLog> _items = [];

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
      final items = await widget.adminService.fetchActivityLogs(type: _type);
      if (mounted) setState(() => _items = items);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _changeType(String type) async {
    if (_type == type) return;
    setState(() => _type = type);
    await _load();
  }

  void _openInquiry(InquiryActivityLog log) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryDetailScreen(
          adminManagementService: widget.adminService,
          currentAdmin: widget.currentAdmin,
          inquiryId: log.inquiryId,
          inquiryService: widget.inquiryService,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('문의 처리 로그')),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
              child: SizedBox(
                width: double.infinity,
                child: SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'ALL', label: Text('전체')),
                    ButtonSegment(value: 'COMPLETED', label: Text('문의')),
                    ButtonSegment(value: 'ASSIGNMENT', label: Text('배정자')),
                  ],
                  selected: {_type},
                  showSelectedIcon: false,
                  onSelectionChanged: (selected) => _changeType(selected.first),
                ),
              ),
            ),
            Expanded(
              child: _isLoading
                  ? const LoadingView()
                  : _error != null
                      ? ErrorView(message: _error!, onRetry: _load)
                      : _items.isEmpty
                          ? const EmptyState(message: '해당 유형의 로그가 없습니다.')
                          : RefreshIndicator(
                              onRefresh: _load,
                              child: ListView.separated(
                                padding: const EdgeInsets.all(16),
                                itemCount: _items.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 10),
                                itemBuilder: (context, index) {
                                  final log = _items[index];
                                  final inquiryLabel = log.companyName
                                          .trim()
                                          .isNotEmpty
                                      ? '${log.companyName} · ${log.contactPersonLabel}'
                                      : log.contactPersonLabel;
                                  final actionLabel = switch (log.type) {
                                    InquiryActivityType.completed =>
                                      '${log.adminLabel} 님이 처리 완료',
                                    InquiryActivityType.assigned =>
                                      '${log.adminLabel} 님이 ${log.assignedAdminLabel} 님에게 문의 배정',
                                    InquiryActivityType.unassigned =>
                                      '${log.adminLabel} 님이 담당자 배정 해제',
                                  };
                                  return Card(
                                    elevation: 0,
                                    child: ListTile(
                                      onTap: () => _openInquiry(log),
                                      title: Text(
                                        log.registrationNumber.isEmpty
                                            ? inquiryLabel
                                            : '${log.registrationNumber} · $inquiryLabel',
                                      ),
                                      subtitle: Text(
                                        '$actionLabel\n${DateFormat("yyyy.MM.dd HH:mm").format(log.occurredAt.toLocal())}',
                                      ),
                                      isThreeLine: true,
                                      trailing: const Icon(Icons.chevron_right),
                                    ),
                                  );
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
