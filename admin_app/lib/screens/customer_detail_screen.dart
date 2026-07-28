import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/colors.dart';
import '../models/admin_user.dart';
import '../models/customer.dart';
import '../services/admin_management_service.dart';
import '../services/api_client.dart';
import '../services/customer_service.dart';
import '../services/inquiry_service.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_view.dart';
import 'company_detail_screen.dart';
import 'inquiry_detail_screen.dart';

class CustomerDetailScreen extends StatefulWidget {
  const CustomerDetailScreen({
    required this.customerId,
    required this.currentAdmin,
    required this.customerService,
    required this.inquiryService,
    required this.adminManagementService,
    super.key,
  });

  final String customerId;
  final AdminUser currentAdmin;
  final CustomerService customerService;
  final InquiryService inquiryService;
  final AdminManagementService adminManagementService;

  @override
  State<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends State<CustomerDetailScreen> {
  final _memoController = TextEditingController();
  Customer? _customer;
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
      final customer =
          await widget.customerService.fetchCustomer(widget.customerId);
      if (!mounted) return;
      setState(() {
        _customer = customer;
        _memoController.text = customer.memo ?? '';
      });
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleFavorite() async {
    final customer = _customer;
    if (customer == null) return;
    await widget.customerService.setFavorite(customer.id, !customer.isFavorite);
    await _load();
  }

  Future<void> _saveMemo() async {
    final customer = _customer;
    if (customer == null || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      await widget.customerService
          .updateCustomerMemo(customer.id, _memoController.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('고객 메모를 저장했습니다.')),
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

  Future<void> _mergeWith(Customer target) async {
    final customer = _customer;
    if (customer == null || _isSaving) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('고객 병합'),
        content: Text(
          '${customer.nameLabel} 고객의 모든 문의를 ${target.nameLabel} 고객 기록으로 합칠까요?\n\n병합 후 현재 고객 항목은 사라지며 되돌리기 어렵습니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('병합 확인'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isSaving = true);
    try {
      await widget.customerService.mergeCustomer(customer.id, target.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('고객 기록을 병합했습니다.')),
      );
      Navigator.pop(context, true);
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

  void _openCompany(CustomerCompany company) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CompanyDetailScreen(
          companyId: company.id,
          currentAdmin: widget.currentAdmin,
          customerService: widget.customerService,
          inquiryService: widget.inquiryService,
          adminManagementService: widget.adminManagementService,
        ),
      ),
    );
  }

  Future<void> _launch(String scheme, String? value) async {
    if (value?.isNotEmpty != true) return;
    await launchUrl(Uri.parse('$scheme:$value'));
  }

  Widget _inquirySection(
    String title,
    List<CustomerInquirySummary> inquiries,
  ) {
    return Card(
      elevation: 0,
      child: ExpansionTile(
        initiallyExpanded: inquiries.isNotEmpty,
        title: Text(
          '$title (${inquiries.length}건)',
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
        ),
        children: inquiries.isEmpty
            ? const [
                ListTile(title: Text('해당 문의가 없습니다.')),
              ]
            : inquiries
                .map(
                  (inquiry) => ListTile(
                    title: Text(
                      '접수번호 ${inquiry.registrationNumber}',
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    subtitle: Text(
                      inquiry.status == CustomerInquiryStatus.pending
                          ? '진행 중 문의'
                          : '처리 완료 문의',
                    ),
                    trailing: const Text(
                      '이동',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    onTap: () => _openInquiry(inquiry.id),
                  ),
                )
                .toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final customer = _customer;
    final pending = customer?.inquiries
            .where((item) => item.status == CustomerInquiryStatus.pending)
            .toList() ??
        [];
    final completed = customer?.inquiries
            .where((item) => item.status == CustomerInquiryStatus.completed)
            .toList() ??
        [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('고객 상세'),
        actions: [
          if (customer != null)
            TextButton.icon(
              onPressed: _toggleFavorite,
              style: TextButton.styleFrom(foregroundColor: Colors.white),
              icon: Icon(
                customer.isFavorite ? Icons.star : Icons.star_border,
              ),
              label: Text(customer.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'),
            ),
        ],
      ),
      body: _isLoading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : customer == null
                  ? ErrorView(message: '고객을 찾을 수 없습니다.', onRetry: _load)
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
                                Text(
                                  customer.nameLabel,
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                if (customer.company != null) ...[
                                  const SizedBox(height: 4),
                                  TextButton.icon(
                                    onPressed: () =>
                                        _openCompany(customer.company!),
                                    icon: const Icon(Icons.business),
                                    label: Text(
                                      '${customer.company!.name} 회사 상세 보기',
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 14),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    OutlinedButton.icon(
                                      onPressed:
                                          customer.phone?.isNotEmpty == true
                                              ? () => _launch(
                                                    'tel',
                                                    customer.phone,
                                                  )
                                              : null,
                                      icon: const Icon(Icons.phone),
                                      label: const Text('전화하기'),
                                    ),
                                    OutlinedButton.icon(
                                      onPressed:
                                          customer.phone?.isNotEmpty == true
                                              ? () => _launch(
                                                    'sms',
                                                    customer.phone,
                                                  )
                                              : null,
                                      icon: const Icon(Icons.sms_outlined),
                                      label: const Text('문자하기'),
                                    ),
                                    OutlinedButton.icon(
                                      onPressed:
                                          customer.email?.isNotEmpty == true
                                              ? () => _launch(
                                                    'mailto',
                                                    customer.email,
                                                  )
                                              : null,
                                      icon: const Icon(Icons.email_outlined),
                                      label: const Text('이메일'),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text('전화번호  ${customer.phone ?? "-"}'),
                                Text('이메일  ${customer.email ?? "-"}'),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        _inquirySection('진행 중 문의', pending),
                        _inquirySection('이전 문의', completed),
                        if (widget.currentAdmin.isSuperAdmin &&
                            customer.duplicateCandidates.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Card(
                            elevation: 0,
                            color: const Color(0xFFFFF7E8),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    '중복 고객 검토',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    '같은 고객이 확실한 경우에만 병합해 주세요.',
                                  ),
                                  const SizedBox(height: 10),
                                  ...customer.duplicateCandidates.map(
                                    (match) => Container(
                                      margin: const EdgeInsets.only(bottom: 10),
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(10),
                                        border:
                                            Border.all(color: AppColors.line),
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '${match.customer.nameLabel} · ${match.customer.companyNameLabel}',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(match.reasonLabel),
                                          const SizedBox(height: 10),
                                          SizedBox(
                                            width: double.infinity,
                                            child: FilledButton.icon(
                                              onPressed: _isSaving
                                                  ? null
                                                  : () => _mergeWith(
                                                        match.customer,
                                                      ),
                                              icon: const Icon(
                                                Icons.merge_type,
                                              ),
                                              label: const Text(
                                                '이 고객으로 병합',
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 10),
                        Card(
                          elevation: 0,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '고객 메모',
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
                                    hintText: '고객 관련 메모를 입력하세요.',
                                  ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: _isSaving ? null : _saveMemo,
                                    icon: const Icon(Icons.save_outlined),
                                    label: Text(
                                      _isSaving ? '저장 중...' : '고객 메모 저장',
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
