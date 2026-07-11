import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/completion_log.dart';
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
    required this.inquiryService,
    super.key,
  });

  final AdminManagementService adminService;
  final InquiryService inquiryService;

  @override
  State<ActivityLogScreen> createState() => _ActivityLogScreenState();
}

class _ActivityLogScreenState extends State<ActivityLogScreen> {
  bool _isLoading = true;
  String? _error;
  List<CompletionLog> _items = [];

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
      final items = await widget.adminService.fetchCompletionLogs();
      if (mounted) setState(() => _items = items);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openInquiry(CompletionLog log) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryDetailScreen(
          inquiryId: log.inquiryId,
          inquiryService: widget.inquiryService,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('완료 처리 로그')),
      body: _isLoading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _items.isEmpty
                  ? const EmptyState(message: '아직 완료 처리 로그가 없습니다.')
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final log = _items[index];
                          final adminName = log.adminDisplayName?.isNotEmpty ==
                                  true
                              ? '${log.adminDisplayName} (${log.adminUsername})'
                              : log.adminUsername;
                          return Card(
                            elevation: 0,
                            child: ListTile(
                              onTap: () => _openInquiry(log),
                              title: Text(
                                  '${log.companyName} · ${log.contactPerson}'),
                              subtitle: Text(
                                '$adminName 님이 처리 완료\n${DateFormat("yyyy.MM.dd HH:mm").format(log.completedAt.toLocal())}',
                              ),
                              isThreeLine: true,
                              trailing: const Icon(Icons.chevron_right),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
