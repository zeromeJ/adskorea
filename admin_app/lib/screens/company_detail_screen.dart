import 'package:flutter/material.dart';
import '../models/admin_user.dart';
import '../models/customer.dart';
import '../services/admin_management_service.dart';
import '../services/api_client.dart';
import '../services/customer_service.dart';
import '../services/inquiry_service.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_view.dart';
import 'inquiry_detail_screen.dart';

class CompanyDetailScreen extends StatefulWidget {
  const CompanyDetailScreen({
    required this.companyId,
    required this.currentAdmin,
    required this.customerService,
    required this.inquiryService,
    required this.adminManagementService,
    super.key,
  });

  final String companyId;
  final AdminUser currentAdmin;
  final CustomerService customerService;
  final InquiryService inquiryService;
  final AdminManagementService adminManagementService;

  @override
  State<CompanyDetailScreen> createState() => _CompanyDetailScreenState();
}

class _CompanyDetailScreenState extends State<CompanyDetailScreen> {
  final _memoController = TextEditingController();
  CompanyDetail? _company;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _memoSaved = false;
  String _memoVisibility = 'SHARED';
  String _sharedMemo = '';
  String _privateMemo = '';
  final Set<String> _expandedContacts = {};
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _memoController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final company =
          await widget.customerService.fetchCompany(widget.companyId);
      if (!mounted) return;
      setState(() {
        _company = company;
        _sharedMemo = company.memo ?? '';
        _privateMemo = company.privateMemo ?? '';
        _memoController.text =
            _memoVisibility == 'SHARED' ? _sharedMemo : _privateMemo;
        _memoSaved = false;
      });
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveMemo() async {
    if (_company == null || _isSaving) return;
    setState(() {
      _isSaving = true;
      _memoSaved = false;
    });
    try {
      await widget.customerService.updateCompanyMemo(
        _company!.id,
        _memoController.text,
        visibility: _memoVisibility,
      );
      if (mounted) {
        setState(() {
          if (_memoVisibility == 'SHARED') {
            _sharedMemo = _memoController.text;
          } else {
            _privateMemo = _memoController.text;
          }
          _memoSaved = true;
        });
      }
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _changeMemoVisibility(String visibility) {
    if (_memoVisibility == 'SHARED') {
      _sharedMemo = _memoController.text;
    } else {
      _privateMemo = _memoController.text;
    }
    setState(() {
      _memoVisibility = visibility;
      _memoController.text =
          visibility == 'SHARED' ? _sharedMemo : _privateMemo;
      _memoSaved = false;
    });
  }

  bool get _hasUnsavedMemo {
    final original = _memoVisibility == 'SHARED' ? _sharedMemo : _privateMemo;
    return _memoController.text.trim() != original.trim();
  }

  Future<bool> _confirmLeave() async {
    if (!_hasUnsavedMemo) return true;
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('나가시겠습니까?'),
            content: const Text('저장하지 않은 내용이 있습니다.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('계속 작성'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('나가기'),
              ),
            ],
          ),
        ) ??
        false;
  }

  void _openInquiry(String id) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryDetailScreen(
          adminManagementService: widget.adminManagementService,
          currentAdmin: widget.currentAdmin,
          inquiryId: id,
          inquiryService: widget.inquiryService,
          customerService: widget.customerService,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final company = _company;
    return PopScope(
      canPop: !_hasUnsavedMemo,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _confirmLeave() && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('회사 상세')),
        body: _isLoading
            ? const LoadingView()
            : _error != null
                ? ErrorView(message: _error!, onRetry: _load)
                : company == null
                    ? ErrorView(message: '회사를 찾을 수 없습니다.', onRetry: _load)
                    : ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          Card(
                            elevation: 0,
                            child: Padding(
                              padding: const EdgeInsets.all(18),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    '회사명',
                                    style:
                                        TextStyle(fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    company.name,
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Card(
                            elevation: 0,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Padding(
                                    padding: EdgeInsets.fromLTRB(12, 10, 12, 4),
                                    child: Text(
                                      '등록된 담당자',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                  ...company.customers.map(
                                    (contact) {
                                      final pendingCount = contact.inquiries
                                          .where(
                                            (item) =>
                                                item.status ==
                                                CustomerInquiryStatus.pending,
                                          )
                                          .length;
                                      final expanded = _expandedContacts
                                          .contains(contact.id);
                                      return ExpansionTile(
                                        onExpansionChanged: (value) =>
                                            setState(() {
                                          if (value) {
                                            _expandedContacts.add(contact.id);
                                          } else {
                                            _expandedContacts
                                                .remove(contact.id);
                                          }
                                        }),
                                        title: Text(
                                          contact.nameLabel,
                                          style: const TextStyle(
                                            fontSize: 17,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                        subtitle: Text(
                                          '진행 중 $pendingCount건 · 전체 ${contact.inquiries.length}건 · '
                                          '${expanded ? "닫기" : "보기"}',
                                        ),
                                        children: contact.inquiries.isEmpty
                                            ? const [
                                                ListTile(
                                                  title: Text('연결된 문의가 없습니다.'),
                                                ),
                                              ]
                                            : contact.inquiries
                                                .map(
                                                  (inquiry) => ListTile(
                                                    title: Text(
                                                      '접수번호 ${inquiry.registrationNumber}',
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w800,
                                                      ),
                                                    ),
                                                    trailing: const Text('이동'),
                                                    onTap: () => _openInquiry(
                                                        inquiry.id),
                                                  ),
                                                )
                                                .toList(),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Card(
                            elevation: 0,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    '회사 공통 메모',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  SegmentedButton<String>(
                                    segments: const [
                                      ButtonSegment(
                                        value: 'SHARED',
                                        label: Text('관리자 공유'),
                                      ),
                                      ButtonSegment(
                                        value: 'PRIVATE',
                                        label: Text('나만 보기'),
                                      ),
                                    ],
                                    selected: {_memoVisibility},
                                    showSelectedIcon: false,
                                    onSelectionChanged: (selected) =>
                                        _changeMemoVisibility(selected.first),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _memoVisibility == 'SHARED'
                                        ? '담당 관리자들이 함께 봅니다.'
                                        : '작성자에게만 표시됩니다.',
                                  ),
                                  const SizedBox(height: 10),
                                  TextField(
                                    controller: _memoController,
                                    minLines: 4,
                                    maxLines: 8,
                                    decoration: const InputDecoration(
                                      hintText:
                                          '회사 전체 담당자에게 공통으로 참고할 내용을 입력하세요.',
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  SizedBox(
                                    width: double.infinity,
                                    child: FilledButton(
                                      onPressed: _isSaving ? null : _saveMemo,
                                      child: Text(
                                        _isSaving ? '저장 중' : '저장',
                                      ),
                                    ),
                                  ),
                                  if (_memoSaved) ...[
                                    const SizedBox(height: 8),
                                    const Text(
                                      '저장되었습니다.',
                                      style: TextStyle(
                                          fontWeight: FontWeight.w900),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
      ),
    );
  }
}
