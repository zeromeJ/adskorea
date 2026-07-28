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
        _memoController.text = company.memo ?? '';
      });
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveMemo() async {
    if (_company == null || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      await widget.customerService
          .updateCompanyMemo(_company!.id, _memoController.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('회사 공통 메모를 저장했습니다.')),
        );
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
    return Scaffold(
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
                                  style: TextStyle(fontWeight: FontWeight.w700),
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
                                  (contact) => ExpansionTile(
                                    title: Text(
                                      contact.nameLabel,
                                      style: const TextStyle(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    subtitle: Text(
                                      '접수 문의 ${contact.inquiries.length}건',
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
                                                    fontWeight: FontWeight.w800,
                                                  ),
                                                ),
                                                trailing: const Text('이동'),
                                                onTap: () =>
                                                    _openInquiry(inquiry.id),
                                              ),
                                            )
                                            .toList(),
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
                                TextField(
                                  controller: _memoController,
                                  minLines: 4,
                                  maxLines: 8,
                                  decoration: const InputDecoration(
                                    hintText: '회사 전체 담당자에게 공통으로 참고할 내용을 입력하세요.',
                                  ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: _isSaving ? null : _saveMemo,
                                    icon: const Icon(Icons.save_outlined),
                                    label: Text(
                                      _isSaving ? '저장 중...' : '회사 메모 저장',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
    );
  }
}
