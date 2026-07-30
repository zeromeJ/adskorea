import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
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
import 'company_picker_screen.dart';
import '../widgets/adaptive_action_buttons.dart';

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
  bool _memoSaved = false;
  String _memoVisibility = 'SHARED';
  String _sharedMemo = '';
  String _privateMemo = '';
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
        _sharedMemo = customer.memo ?? '';
        _privateMemo = customer.privateMemo ?? '';
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

  Future<void> _toggleFavorite() async {
    final customer = _customer;
    if (customer == null) return;
    await widget.customerService.setFavorite(customer.id, !customer.isFavorite);
    await _load();
  }

  Future<void> _saveMemo() async {
    final customer = _customer;
    if (customer == null || _isSaving) return;
    setState(() {
      _isSaving = true;
      _memoSaved = false;
    });
    try {
      await widget.customerService.updateCustomerMemo(
        customer.id,
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

  Future<void> _openCompanyPicker() async {
    final customer = _customer;
    if (customer == null) return;
    if (!widget.currentAdmin.canManageInquiries) {
      await _requestReview('COMPANY_REVIEW');
      return;
    }
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => CompanyPickerScreen(
          customerId: customer.id,
          service: widget.customerService,
          currentCompany: customer.company,
        ),
      ),
    );
    if (changed == true) await _load();
  }

  Future<void> _unlinkCompany() async {
    final customer = _customer;
    if (customer == null || customer.company == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('연결을 해제할까요?'),
        content: Text('${customer.company!.name} 회사와의 연결을 해제합니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('연결 해제'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await widget.customerService.changeCustomerCompany(
      customer.id,
      action: 'UNLINK',
    );
    await _load();
  }

  Future<void> _requestReview(String type) async {
    final customer = _customer;
    if (customer == null || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      await widget.customerService.requestReview(customer.id, type: type);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('최고 관리자에게 검토를 요청했습니다.')),
      );
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _mergeWith(Customer candidate) async {
    final customer = _customer;
    if (customer == null || _isSaving) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('고객 기록 합치기'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '두 기록을 확인해 주세요.',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            const Text(
              '기준 고객 (유지)',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 3),
            Text(customer.nameLabel),
            const SizedBox(height: 14),
            const Text(
              '합칠 기록',
              style: TextStyle(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 3),
            Text(
              '${candidate.nameLabel} · 문의 ${candidate.inquiries.length}건',
            ),
            const SizedBox(height: 16),
            const Text(
              '다른 후보는 그대로 남으며, 이 작업은 아래 기록에서 따로 되돌릴 수 있습니다.',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('기록 합치기'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isSaving = true);
    try {
      await widget.customerService.mergeCustomer(candidate.id, customer.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('후보 1명을 병합했습니다. 다른 후보는 그대로 유지됩니다.')),
      );
      await _load();
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _undoMerge(CustomerMergeHistory history) async {
    final customer = _customer;
    if (customer == null || _isSaving || history.isUndone) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('이 병합만 되돌리기'),
        content: Text(
          '${history.sourceCustomer.nameLabel} 고객과 문의 ${history.movedInquiries.length}건을 다시 분리할까요?\n\n다른 병합 기록은 변경되지 않습니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('되돌리기 확인'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _isSaving = true);
    try {
      await widget.customerService.undoCustomerMerge(customer.id, history.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('선택한 병합 1건만 되돌렸습니다.')),
      );
      await _load();
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

  Widget _mergeHistorySection(Customer customer) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '합친 기록',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 5),
            const Text(
              '합친 고객 기록을 확인하고 하나씩 되돌릴 수 있습니다.',
              style: TextStyle(color: AppColors.subText),
            ),
            const SizedBox(height: 12),
            if (customer.mergeHistory.isEmpty)
              const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: Text('아직 합친 기록이 없습니다.'),
              )
            else
              ...customer.mergeHistory.map(
                (history) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: history.isUndone
                        ? const Color(0xFFF3F4F3)
                        : const Color(0xFFF1F7F3),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color:
                          history.isUndone ? AppColors.line : AppColors.primary,
                    ),
                  ),
                  child: ExpansionTile(
                    tilePadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 4,
                    ),
                    childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                    leading: Icon(
                      history.isUndone ? Icons.undo : Icons.call_merge_outlined,
                      color: history.isUndone
                          ? AppColors.subText
                          : AppColors.primary,
                    ),
                    title: Text(
                      history.sourceCustomer.nameLabel,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    subtitle: Text(
                      '${history.isUndone ? "되돌림 완료" : "병합 유지 중"} · 문의 ${history.movedInquiries.length}건\n'
                      '${DateFormat("yyyy.MM.dd HH:mm").format(history.createdAt.toLocal())} · ${history.mergedByLabel}',
                    ),
                    children: [
                      const Divider(),
                      if (history.movedInquiries.isEmpty)
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: Text('기록된 문의가 없습니다.'),
                          ),
                        )
                      else
                        ...history.movedInquiries.map(
                          (inquiry) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            dense: true,
                            title: Text(
                              '접수번호 ${inquiry.registrationNumber}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.w800),
                            ),
                            trailing: const Text('문의 보기'),
                            onTap: () => _openInquiry(inquiry.id),
                          ),
                        ),
                      if (history.isUndone)
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            '되돌린 관리자: ${history.undoneByDisplayName?.trim().isNotEmpty == true ? history.undoneByDisplayName : "관리자"}',
                            style: const TextStyle(
                              color: AppColors.subText,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        )
                      else
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed:
                                _isSaving ? null : () => _undoMerge(history),
                            icon: const Icon(Icons.undo),
                            label: const Text('이 병합 1건만 되돌리기'),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _companySection(Customer customer) {
    final company = customer.company;
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '회사',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              company?.name ?? '회사 정보가 없습니다.',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            if (company == null)
              AdaptiveActionButtons(
                children: [
                  OutlinedButton(
                    onPressed: _openCompanyPicker,
                    child: Text(widget.currentAdmin.canManageInquiries
                        ? '회사 연결'
                        : '검토 요청'),
                  ),
                  if (widget.currentAdmin.canManageInquiries)
                    FilledButton(
                      onPressed: _openCompanyPicker,
                      child: const Text('회사 추가'),
                    ),
                ],
              )
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton(
                    onPressed: () => _openCompany(company),
                    child: const Text('회사 보기'),
                  ),
                  const SizedBox(height: 8),
                  if (widget.currentAdmin.canManageInquiries)
                    AdaptiveActionButtons(
                      children: [
                        OutlinedButton(
                          onPressed: _openCompanyPicker,
                          child: const Text('회사 변경'),
                        ),
                        TextButton(
                          onPressed: _unlinkCompany,
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red.shade700,
                          ),
                          child: const Text('연결 해제'),
                        ),
                      ],
                    )
                  else
                    OutlinedButton(
                      onPressed: () => _requestReview('COMPANY_REVIEW'),
                      child: const Text('검토 요청'),
                    ),
                ],
              ),
            if (customer.companyChangeLogs.isNotEmpty) ...[
              const SizedBox(height: 14),
              ExpansionTile(
                tilePadding: EdgeInsets.zero,
                title: Text(
                  '회사 변경 기록 ${customer.companyChangeLogs.length}건',
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                children: customer.companyChangeLogs
                    .map(
                      (log) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          '${log.previousCompanyName ?? "없음"} → '
                          '${log.newCompanyName ?? "없음"}',
                        ),
                        subtitle: Text(
                          '${log.adminLabel} · '
                          '${DateFormat("yyyy.MM.dd HH:mm").format(log.createdAt.toLocal())}',
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _duplicateNotice(Customer customer) {
    if (!customer.hasPendingDuplicate) return const SizedBox.shrink();
    return Card(
      elevation: 0,
      color: const Color(0xFFFFF7E8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '확인 필요',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            const Text('같은 고객일 가능성이 있는 기록이 있습니다.'),
            if (!widget.currentAdmin.isSuperAdmin) ...[
              const SizedBox(height: 12),
              FilledButton(
                onPressed:
                    _isSaving ? null : () => _requestReview('DUPLICATE_REVIEW'),
                child: Text(_isSaving ? '요청 중' : '검토 요청'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _comparisonCard(String label, Customer customer) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            customer.nameLabel,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text('전화번호  ${customer.phone ?? "-"}'),
          Text('이메일  ${customer.email ?? "-"}'),
          Text('회사명  ${customer.company?.name ?? "-"}'),
          Text('문의 수  ${customer.inquiries.length}건'),
        ],
      ),
    );
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

    return PopScope(
      canPop: !_hasUnsavedMemo,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _confirmLeave() && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
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
                                  const SizedBox(height: 14),
                                  AdaptiveActionButtons(
                                    children: [
                                      OutlinedButton(
                                        onPressed:
                                            customer.phone?.isNotEmpty == true
                                                ? () => _launch(
                                                      'tel',
                                                      customer.phone,
                                                    )
                                                : null,
                                        child: const Text('전화'),
                                      ),
                                      OutlinedButton(
                                        onPressed:
                                            customer.phone?.isNotEmpty == true
                                                ? () => _launch(
                                                      'sms',
                                                      customer.phone,
                                                    )
                                                : null,
                                        child: const Text('문자'),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton(
                                      onPressed:
                                          customer.email?.isNotEmpty == true
                                              ? () => _launch(
                                                    'mailto',
                                                    customer.email,
                                                  )
                                              : null,
                                      child: const Text('이메일'),
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text('전화번호  ${customer.phone ?? "-"}'),
                                  Text('이메일  ${customer.email ?? "-"}'),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          _duplicateNotice(customer),
                          if (customer.hasPendingDuplicate)
                            const SizedBox(height: 10),
                          _companySection(customer),
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
                                      '같은 고객인지 확인',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    _comparisonCard('현재 고객', customer),
                                    const SizedBox(height: 10),
                                    Text(
                                      '확인할 기록 ${customer.duplicateCandidates.length}명',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      '같은 고객이 확실할 때만 한 명씩 기록을 합쳐 주세요. 나머지는 그대로 남습니다.',
                                    ),
                                    const SizedBox(height: 10),
                                    ...customer.duplicateCandidates.map(
                                      (match) => Container(
                                        margin:
                                            const EdgeInsets.only(bottom: 10),
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(10),
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
                                            _comparisonCard(
                                              '비교 고객',
                                              match.customer,
                                            ),
                                            const SizedBox(height: 10),
                                            SizedBox(
                                              width: double.infinity,
                                              child: FilledButton(
                                                onPressed: _isSaving
                                                    ? null
                                                    : () => _mergeWith(
                                                          match.customer,
                                                        ),
                                                child: const Text('고객 기록 합치기'),
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
                          if (widget.currentAdmin.isSuperAdmin) ...[
                            const SizedBox(height: 10),
                            _mergeHistorySection(customer),
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
                                    '이 고객 메모',
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
                                      hintText: '고객 관련 메모를 입력하세요.',
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
