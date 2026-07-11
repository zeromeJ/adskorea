import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/inquiry.dart';
import '../screens/inquiry_detail_screen.dart';
import '../services/auth_service.dart';
import '../services/inquiry_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/inquiry_card.dart';
import '../widgets/loading_view.dart';

class InquiryListScreen extends StatefulWidget {
  const InquiryListScreen({
    required this.authService,
    required this.inquiryService,
    required this.onLogout,
    super.key,
  });

  final AuthService authService;
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
      setState(() => _items = result.items);
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
    await widget.inquiryService.updateInquiry(
      inquiry.id,
      status: InquiryStatus.completed,
    );
    await _load();
  }

  String get _emptyMessage {
    if (_status == 'PENDING') return '처리 전 문의가 없습니다.';
    if (_status == 'COMPLETED') return '처리 완료된 문의가 없습니다.';
    return '아직 접수된 문의가 없습니다.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ADS 문의관리'),
        actions: [
          IconButton(
            onPressed: () async {
              await widget.authService.logout();
              widget.onLogout();
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'ALL', label: Text('전체')),
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
                              padding: const EdgeInsets.all(12),
                              itemBuilder: (context, index) {
                                final inquiry = _items[index];
                                return InquiryCard(
                                  inquiry: inquiry,
                                  onOpen: () async {
                                    await Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => InquiryDetailScreen(
                                          inquiryId: inquiry.id,
                                          inquiryService: widget.inquiryService,
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
                                  const SizedBox(height: 10),
                              itemCount: _items.length,
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
