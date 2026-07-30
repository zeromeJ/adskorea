import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/colors.dart';
import '../models/admin_user.dart';
import '../models/customer.dart';
import '../models/inquiry.dart';
import '../services/admin_management_service.dart';
import '../services/api_client.dart';
import '../services/inquiry_service.dart';
import '../services/customer_service.dart';
import '../widgets/error_view.dart';
import '../widgets/duplicate_detection_badge.dart';
import '../widgets/loading_view.dart';
import '../widgets/status_chip.dart';
import '../widgets/adaptive_action_buttons.dart';
import 'assignment_picker_screen.dart';
import 'attachment_detail_screen.dart';
import 'consultation_record_screen.dart';

class InquiryDetailScreen extends StatefulWidget {
  const InquiryDetailScreen({
    required this.adminManagementService,
    required this.currentAdmin,
    required this.inquiryId,
    required this.inquiryService,
    required this.customerService,
    super.key,
  });

  final AdminManagementService adminManagementService;
  final AdminUser currentAdmin;
  final String inquiryId;
  final InquiryService inquiryService;
  final CustomerService customerService;

  @override
  State<InquiryDetailScreen> createState() => _InquiryDetailScreenState();
}

class _InquiryDetailScreenState extends State<InquiryDetailScreen> {
  Inquiry? _inquiry;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isAssigning = false;
  bool _isCustomerAction = false;
  bool _memoSaved = false;
  String? _error;
  List<AdminUser> _admins = [];
  final _memoController = TextEditingController();

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
      final inquiry =
          await widget.inquiryService.fetchInquiry(widget.inquiryId);
      final admins = widget.currentAdmin.canManageInquiries
          ? await widget.adminManagementService.fetchAssignmentCandidates()
          : const <AdminUser>[];
      final activeAdmins = admins.where((admin) => admin.isActive).toList()
        ..sort((left, right) {
          final roleOrder =
              (left.isSuperAdmin ? 1 : 0).compareTo(right.isSuperAdmin ? 1 : 0);
          if (roleOrder != 0) return roleOrder;
          return left.displayLabel.compareTo(right.displayLabel);
        });
      if (!mounted) return;
      setState(() {
        _inquiry = inquiry;
        _admins = activeAdmins;
        _memoController.text = inquiry.adminMemo ?? '';
        _memoSaved = false;
      });
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _assignAdmin(String? adminId) async {
    if (_isAssigning) return;
    setState(() => _isAssigning = true);
    try {
      await widget.inquiryService.assignInquiry(
        widget.inquiryId,
        adminId,
      );
      await _load();
      _showSnack(
          adminId == null ? '문의 담당자 배정을 해제했습니다.' : '문의 담당자를 배정하고 알림을 전송했습니다.');
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isAssigning = false);
    }
  }

  Future<void> _openAssignment() async {
    final inquiry = _inquiry;
    if (inquiry == null || _isAssigning) return;
    final choice = await Navigator.of(context).push<AssignmentChoice>(
      MaterialPageRoute(
        builder: (_) => AssignmentPickerScreen(
          admins: _admins,
          currentAdminId: inquiry.assignedAdminId,
        ),
      ),
    );
    if (choice != null) await _assignAdmin(choice.adminId);
  }

  Future<void> _linkCustomer(String customerId, String customerName) async {
    if (_isCustomerAction) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('후보 1명 연결'),
        content: Text(
          '$customerName 고객의 기존 문의를 현재 고객 기록에 연결할까요?\n\n현재 고객은 기준으로 유지되고, 선택하지 않은 비교 후보도 계속 남습니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('연결 확인'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isCustomerAction = true);
    try {
      await widget.customerService.linkInquiryToCustomer(
        widget.inquiryId,
        customerId,
      );
      await _load();
      _showSnack('후보 1명을 연결했습니다. 남은 후보는 계속 비교할 수 있습니다.');
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isCustomerAction = false);
    }
  }

  Future<void> _keepNewCustomer() async {
    if (_isCustomerAction) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('새 고객으로 유지'),
        content: const Text(
          '기존 고객과 연결하지 않고 별도의 새 고객으로 유지할까요?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('새 고객 유지'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isCustomerAction = true);
    try {
      await widget.customerService.keepInquiryAsNewCustomer(widget.inquiryId);
      await _load();
      _showSnack('새 고객으로 유지했습니다.');
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isCustomerAction = false);
    }
  }

  Future<void> _unlinkCustomer() async {
    if (_isCustomerAction) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('고객 연결 해제'),
        content: const Text(
          '이 문의를 현재 고객 기록에서 분리할까요?\n\n문의 내용은 삭제되지 않고 별도의 고객으로 분리됩니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('연결 해제 확인'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isCustomerAction = true);
    try {
      await widget.customerService.unlinkInquiryCustomer(widget.inquiryId);
      await _load();
      _showSnack('고객 연결을 해제하고 별도 고객으로 분리했습니다.');
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isCustomerAction = false);
    }
  }

  void _openPreviousInquiry(String inquiryId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryDetailScreen(
          adminManagementService: widget.adminManagementService,
          currentAdmin: widget.currentAdmin,
          inquiryId: inquiryId,
          inquiryService: widget.inquiryService,
          customerService: widget.customerService,
        ),
      ),
    );
  }

  Future<void> _requestDuplicateReview(Inquiry inquiry) async {
    final customerId = inquiry.customerId;
    if (customerId == null || _isCustomerAction) return;
    setState(() => _isCustomerAction = true);
    try {
      await widget.customerService.requestReview(
        customerId,
        type: 'DUPLICATE_REVIEW',
      );
      _showSnack('최고 관리자에게 검토를 요청했습니다.');
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isCustomerAction = false);
    }
  }

  Widget _customerConnectionPanel(Inquiry inquiry) {
    final candidates = inquiry.customerMatchCandidates;
    if (candidates.isEmpty) {
      if (inquiry.hasPendingDuplicate && !widget.currentAdmin.isSuperAdmin) {
        return Card(
          elevation: 0,
          color: const Color(0xFFFFF7E8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '확인 필요',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                const Text('같은 고객일 가능성이 있는 기록이 있습니다.'),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _isCustomerAction
                        ? null
                        : () => _requestDuplicateReview(inquiry),
                    child: Text(_isCustomerAction ? '요청 중' : '검토 요청'),
                  ),
                ),
              ],
            ),
          ),
        );
      }
      if (!widget.currentAdmin.isSuperAdmin || inquiry.customer == null) {
        return const SizedBox.shrink();
      }
      return Card(
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.person_outline),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '연결 고객: ${inquiry.customer!.nameLabel}',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              TextButton(
                onPressed: _isCustomerAction ? null : _unlinkCustomer,
                child: const Text('연결 해제'),
              ),
            ],
          ),
        ),
      );
    }

    final matchMessage = candidates.any((match) => match.matchedPhone)
        ? '동일한 전화번호로 접수된 고객이 있습니다.'
        : candidates.any((match) => match.matchedEmail)
            ? '동일한 이메일로 접수된 고객이 있습니다.'
            : '동일한 회사명의 고객이 있습니다. 같은 회사의 다른 담당자일 수 있습니다.';

    return Card(
      elevation: 0,
      color: const Color(0xFFFFF7E8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE0A94F), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.info_outline, color: Color(0xFF8B5A00)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '같은 고객인지 확인',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '$matchMessage\n내용을 확인한 뒤 연결 여부를 선택해 주세요.',
              style: const TextStyle(fontSize: 16, height: 1.5),
            ),
            const SizedBox(height: 12),
            ...candidates.map((match) {
              final candidate = match.customer;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.line),
                ),
                child: Column(
                  children: [
                    ListTile(
                      title: Text(
                        candidate.nameLabel,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      subtitle: Text(
                        '${candidate.companyNameLabel}\n${match.reasonLabel}',
                      ),
                      isThreeLine: true,
                    ),
                    ExpansionTile(
                      title: Text(
                        '이전 문의 ${candidate.inquiries.length}건 펼쳐보기',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      children: candidate.inquiries.isEmpty
                          ? const [
                              ListTile(title: Text('이전 문의가 없습니다.')),
                            ]
                          : candidate.inquiries
                              .map(
                                (previous) => ListTile(
                                  title: Text(
                                    '접수번호 ${previous.registrationNumber}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  trailing: const Text(
                                    '이동',
                                    style: TextStyle(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  onTap: () =>
                                      _openPreviousInquiry(previous.id),
                                ),
                              )
                              .toList(),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                      child: SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: _isCustomerAction
                              ? null
                              : () => _linkCustomer(
                                    candidate.id,
                                    candidate.nameLabel,
                                  ),
                          icon: const Icon(Icons.link),
                          label: const Text('기존 고객과 연결'),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _isCustomerAction ? null : _keepNewCustomer,
                icon: const Icon(Icons.person_add_alt_1),
                label: const Text('별도 유지'),
              ),
            ),
            if (_isCustomerAction) ...[
              const SizedBox(height: 10),
              const LinearProgressIndicator(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _previousInquiriesPanel(Inquiry inquiry) {
    if (!widget.currentAdmin.isSuperAdmin || inquiry.customer == null) {
      return const SizedBox.shrink();
    }

    final previousInquiries = inquiry.customer!.inquiries
        .where(
          (previous) =>
              previous.id != inquiry.id &&
              previous.createdAt.isBefore(inquiry.createdAt),
        )
        .toList()
      ..sort((left, right) => right.createdAt.compareTo(left.createdAt));

    if (previousInquiries.isEmpty) return const SizedBox.shrink();

    return Card(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        initiallyExpanded: false,
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        childrenPadding: const EdgeInsets.fromLTRB(8, 0, 8, 10),
        leading: const Icon(
          Icons.history_rounded,
          color: AppColors.primary,
          size: 26,
        ),
        title: Text(
          '이전 문의 ${previousInquiries.length}건',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: const Text(
          '같은 고객으로 연결된 문의를 펼쳐볼 수 있습니다.',
          style: TextStyle(color: AppColors.subText),
        ),
        children: previousInquiries
            .map(
              (previous) => ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                title: Text(
                  '접수번호 ${previous.registrationNumber}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                subtitle: Text(
                  '${inquiryTypeLabel(previous.inquiryType)} · '
                  '${previous.status == CustomerInquiryStatus.pending ? '진행 중' : '처리 완료'}\n'
                  '${DateFormat('yyyy.MM.dd HH:mm').format(previous.createdAt.toLocal())}',
                ),
                isThreeLine: true,
                trailing: const Text(
                  '이동',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                onTap: () => _openPreviousInquiry(previous.id),
              ),
            )
            .toList(),
      ),
    );
  }

  Future<void> _updateStatus() async {
    final inquiry = _inquiry;
    if (inquiry == null || _isSaving) return;

    final nextStatus = inquiry.status == InquiryStatus.pending
        ? InquiryStatus.completed
        : InquiryStatus.pending;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          nextStatus == InquiryStatus.completed ? '완료할까요?' : '진행 중으로 바꿀까요?',
        ),
        content: Text(
          nextStatus == InquiryStatus.completed
              ? '처리가 끝난 문의로 이동합니다.'
              : '다시 진행 중인 문의로 이동합니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              nextStatus == InquiryStatus.completed ? '완료' : '진행 중',
            ),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isSaving = true);
    await widget.inquiryService.updateInquiry(inquiry.id, status: nextStatus);
    await _load();
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (nextStatus == InquiryStatus.completed) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 10),
          content: const Text('처리 완료되었습니다.'),
          action: SnackBarAction(
            label: '되돌리기',
            onPressed: () async {
              await widget.inquiryService.updateInquiry(
                inquiry.id,
                status: InquiryStatus.pending,
              );
              await _load();
            },
          ),
        ),
      );
    } else {
      _showSnack('진행 중으로 변경했습니다.');
    }
  }

  Future<void> _saveMemo() async {
    final inquiry = _inquiry;
    if (inquiry == null) return;

    setState(() {
      _isSaving = true;
      _memoSaved = false;
    });
    try {
      await widget.inquiryService.updateInquiry(
        inquiry.id,
        adminMemo: _memoController.text,
      );
      await _load();
      if (mounted) setState(() => _memoSaved = true);
    } on ApiException catch (error) {
      _showSnack(error.message);
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _openConsultationRecord() async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ConsultationRecordScreen(
          inquiryId: widget.inquiryId,
          service: widget.inquiryService,
        ),
      ),
    );
    if (saved == true) await _load();
  }

  bool get _hasUnsavedMemo =>
      _inquiry != null &&
      _memoController.text.trim() != (_inquiry!.adminMemo ?? '').trim();

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

  void _showSnack(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _launch(String scheme, String? value) async {
    if (value == null || value.isEmpty) return;
    await launchUrl(Uri.parse('$scheme:$value'));
  }

  Future<void> _copyEmail(String email) async {
    await Clipboard.setData(ClipboardData(text: email));
    if (!mounted) return;
    _showSnack('이메일 주소를 복사했습니다.');
  }

  Widget _section(String title, List<Widget> children) {
    return Card(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.line),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  String _idleLabel(Inquiry inquiry) {
    final duration = inquiry.idleDuration;
    if (duration.inDays > 0) return '${duration.inDays}일';
    if (duration.inHours > 0) return '${duration.inHours}시간';
    if (duration.inMinutes > 0) return '${duration.inMinutes}분';
    return '방금 처리';
  }

  Widget _summarySection(Inquiry inquiry) {
    return _section('핵심 정보', [
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          StatusChip(status: inquiry.status, label: inquiry.attentionLabel),
          if (inquiry.hasPendingDuplicate && widget.currentAdmin.isSuperAdmin)
            const DuplicateDetectionBadge(),
        ],
      ),
      const SizedBox(height: 14),
      _row('담당자', inquiry.assignedAdminLabel),
      _row('미처리 기간', _idleLabel(inquiry)),
      _row('접수번호', inquiry.registrationNumber),
    ]);
  }

  Widget _contactSection(Inquiry inquiry) {
    return _section('연락처', [
      const Text(
        '전화번호',
        style: TextStyle(fontWeight: FontWeight.w900),
      ),
      const SizedBox(height: 4),
      SelectableText(
        inquiry.phone?.isNotEmpty == true ? inquiry.phone! : '-',
        style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900),
      ),
      const SizedBox(height: 10),
      SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: inquiry.phone?.isNotEmpty == true
              ? () => _launch('sms', inquiry.phone)
              : null,
          child: const Text('문자'),
        ),
      ),
      const SizedBox(height: 18),
      const Text(
        '이메일',
        style: TextStyle(fontWeight: FontWeight.w900),
      ),
      const SizedBox(height: 4),
      SelectableText(
        inquiry.email?.isNotEmpty == true ? inquiry.email! : '-',
        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
      ),
      const SizedBox(height: 10),
      SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: inquiry.email?.isNotEmpty == true
              ? () => _copyEmail(inquiry.email!)
              : null,
          child: const Text('복사'),
        ),
      ),
    ]);
  }

  Widget _consultationHistory(Inquiry inquiry) {
    if (inquiry.consultationRecords.isEmpty) {
      return const SizedBox.shrink();
    }
    return _section('상담 기록', [
      ...inquiry.consultationRecords.map(
        (record) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                inquiryConsultationResultLabel(record.result),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                '${record.adminLabel} · '
                '${DateFormat('yyyy.MM.dd HH:mm').format(record.createdAt.toLocal())}',
              ),
              if (record.memo?.isNotEmpty == true) ...[
                const SizedBox(height: 4),
                Text(record.memo!),
              ],
              const Divider(height: 20),
            ],
          ),
        ),
      ),
    ]);
  }

  Widget _row(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child:
                Text(label, style: const TextStyle(color: AppColors.subText)),
          ),
          Expanded(child: Text(value?.isNotEmpty == true ? value! : '-')),
        ],
      ),
    );
  }

  String _responseMethodLabel(String? value) {
    switch (value) {
      case 'EMAIL':
        return '이메일';
      case 'PHONE':
        return '전화';
      case 'TEXT':
        return '문자';
      case 'BOTH':
      case 'ANY':
        return '상관없음';
      default:
        return '-';
    }
  }

  String _booleanLabel(bool? value) {
    if (value == null) return '-';
    return value ? '예' : '아니오';
  }

  String _palletSizesLabel(Inquiry inquiry) {
    if (inquiry.requestedPalletSizes.isNotEmpty) {
      return inquiry.requestedPalletSizes.join('\n');
    }
    return inquiry.requiredPalletSize ?? '-';
  }

  String _detailLabel(String key) {
    const labels = {
      'requiredPalletSize': '필요 규격',
      'deliveryRegion': '납품 지역',
      'desiredDeliveryDate': '희망 납기',
      'annualUsage': '월·연간 사용량',
      'currentPallet': '현재 사용 팔레트',
      'exportUse': '수출용 여부',
      'cargoType': '화물 종류',
      'cargoForm': '화물 형태',
      'totalWeight': '팔레트당 총중량',
      'cargoLength': '화물 길이',
      'cargoWidth': '화물 너비',
      'cargoHeight': '화물 높이',
      'usePurpose': '사용 목적',
      'loadDistribution': '무게중심·하중 분포',
      'centerOfGravity': '무게중심 위치',
      'concentratedLoad': '집중하중 여부',
      'packageUnit': '포장 단위',
      'stackingLayers': '적재단수',
      'fixationMethod': '제품 고정 방식',
      'currentPalletType': '현재 팔레트 종류',
      'currentPalletSize': '현재 팔레트 규격',
      'currentProblems': '현재 팔레트 문제점',
      'exportCountry': '수출 목적국',
      'containerType': '컨테이너 종류',
      'forkliftUse': '지게차 사용 여부',
      'forkSpacing': '포크 간격',
      'handPalletTruckUse': '핸드파레트 사용 여부',
      'rackUse': '랙 적재 여부',
      'rackSupportType': '랙 지지방식',
      'automationUse': '자동화 설비 사용 여부',
      'conveyorUse': '컨베이어 사용 여부',
      'storageTemperature': '보관 온도',
      'moistureRisk': '습윤·침수 가능성',
      'outdoorStorage': '야외 보관 여부',
      'usageCount': '사용 횟수',
      'reuse': '회수·재사용 여부',
      'stacking': '포장 단위·적재단수',
      'destination': '수출 목적국·컨테이너',
      'forklift': '지게차·포크 조건',
      'rackAutomation': '랙·자동화 설비',
      'storageEnvironment': '보관 환경',
      'sizeReviewNeeded': '규격 검토 필요',
      'desiredLength': '희망 길이',
      'desiredWidth': '희망 너비',
      'desiredHeight': '희망 높이',
      'customCargo': '화물·중량',
      'forkEntry': '포크 진입 방향',
      'structureRequirements': '구조 요구사항',
      'nestingRequired': '중첩 적재 필요 여부',
      'customRackUse': '랙 사용 여부',
      'customAutomationUse': '자동화 설비 여부',
      'documentType': '요청 자료',
      'relatedModel': '관련 제품·모델',
      'requestLanguage': '요청 언어',
      'documentPurpose': '자료 사용 목적',
    };
    return labels[key] ?? key;
  }

  @override
  Widget build(BuildContext context) {
    final inquiry = _inquiry;
    final requiresAssignment = inquiry != null &&
        widget.currentAdmin.canManageInquiries &&
        inquiry.status == InquiryStatus.pending &&
        inquiry.assignedAdminId == null;
    final canProcessInquiry = inquiry != null &&
        (widget.currentAdmin.isSuperAdmin ||
            inquiry.assignedAdminId == widget.currentAdmin.id);

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
          title: const Text('문의 상세'),
          actions: [
            if (widget.currentAdmin.isSuperAdmin &&
                inquiry?.hasPendingDuplicate == true)
              const Padding(
                padding: EdgeInsets.only(right: 12),
                child: Center(child: DuplicateDetectionBadge()),
              ),
          ],
        ),
        bottomNavigationBar: inquiry == null
            ? null
            : SafeArea(
                minimum: const EdgeInsets.fromLTRB(16, 10, 16, 14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AdaptiveActionButtons(
                      children: [
                        OutlinedButton(
                          onPressed: canProcessInquiry
                              ? _openConsultationRecord
                              : null,
                          child: const Text('상담 기록하기'),
                        ),
                        FilledButton(
                          onPressed: requiresAssignment ||
                                  !canProcessInquiry ||
                                  _isSaving
                              ? null
                              : _updateStatus,
                          child: Text(
                            _isSaving
                                ? '처리 중'
                                : requiresAssignment
                                    ? '배정 후 완료 가능'
                                    : !canProcessInquiry
                                        ? '담당 문의만 가능'
                                        : inquiry.status ==
                                                InquiryStatus.pending
                                            ? '처리 완료'
                                            : '다시 진행',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
        body: SafeArea(
          top: false,
          child: _isLoading
              ? const LoadingView()
              : _error != null
                  ? ErrorView(message: _error!, onRetry: _load)
                  : inquiry == null
                      ? ErrorView(
                          message: '문의를 찾을 수 없습니다.',
                          onRetry: _load,
                        )
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                          children: [
                            _summarySection(inquiry),
                            if (widget.currentAdmin.canManageInquiries)
                              _section('담당자', [
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: inquiry.assignedAdminId == null
                                        ? const Color(0xFFFFF4E5)
                                        : const Color(0xFFEEF3EE),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '현재 담당: ${inquiry.assignedAdminLabel}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton(
                                    onPressed:
                                        _isAssigning ? null : _openAssignment,
                                    child: Text(
                                      _isAssigning ? '처리 중' : '담당자 선택',
                                    ),
                                  ),
                                ),
                                if (_isAssigning) ...[
                                  const SizedBox(height: 12),
                                  const LinearProgressIndicator(),
                                ],
                                if (inquiry.assignedAt != null) ...[
                                  const SizedBox(height: 10),
                                  Text(
                                    '마지막 배정: ${DateFormat('yyyy.MM.dd HH:mm').format(inquiry.assignedAt!.toLocal())}',
                                    style: const TextStyle(
                                      color: AppColors.subText,
                                    ),
                                  ),
                                ],
                              ]),
                            _contactSection(inquiry),
                            _section('기본 정보', [
                              _row(
                                  '접수 시간',
                                  DateFormat('yyyy.MM.dd HH:mm')
                                      .format(inquiry.createdAt.toLocal())),
                              if (inquiry.companyName.trim().isNotEmpty)
                                _row('회사명', inquiry.companyName),
                              _row('담당자', inquiry.contactPersonLabel),
                              _row('부서·직책', inquiry.department),
                              _row('문의 유형',
                                  inquiryTypeLabel(inquiry.inquiryType)),
                              _row('회신 방법',
                                  _responseMethodLabel(inquiry.responseMethod)),
                            ]),
                            _section('문의 조건', [
                              _row('산업 분야', inquiry.industry),
                              _row('화물 종류', inquiry.cargoType),
                              _row('팔레트당 중량', inquiry.loadPerPallet),
                              _row('예상 수량', inquiry.estimatedQuantity),
                              _row('희망 규격', _palletSizesLabel(inquiry)),
                              _row('납품 지역', inquiry.exportCountry),
                              _row('랙 적재', _booleanLabel(inquiry.rackStorage)),
                              _row('자동화 설비',
                                  _booleanLabel(inquiry.automationUse)),
                              _row(
                                  '지게차 사용', _booleanLabel(inquiry.forkliftUse)),
                              _row('핸드파레트',
                                  _booleanLabel(inquiry.handPalletTruckUse)),
                              _row('현재 팔레트', inquiry.currentPalletType),
                              _row('관심 제품', inquiry.productInterest),
                            ]),
                            if (inquiry.inquiryDetails.isNotEmpty)
                              _section('문의 유형별 상세 정보', [
                                ...inquiry.inquiryDetails.entries.map(
                                  (entry) => _row(
                                    _detailLabel(entry.key),
                                    entry.value?.toString() == 'YES'
                                        ? '예'
                                        : entry.value?.toString(),
                                  ),
                                ),
                              ]),
                            _section('문의 내용', [
                              Text(inquiry.message?.isNotEmpty == true
                                  ? inquiry.message!
                                  : '-'),
                            ]),
                            if (inquiry.attachments.isNotEmpty)
                              _section('첨부파일', [
                                ...inquiry.attachments.map(
                                  (attachment) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: OutlinedButton.icon(
                                      onPressed: () =>
                                          Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              AttachmentDetailScreen(
                                            attachment: attachment,
                                          ),
                                        ),
                                      ),
                                      icon: const Icon(Icons.attach_file,
                                          size: 20),
                                      label: Text(attachment.fileName),
                                    ),
                                  ),
                                ),
                              ]),
                            _section('관리자 메모', [
                              TextField(
                                controller: _memoController,
                                readOnly: !canProcessInquiry,
                                minLines: 3,
                                maxLines: 6,
                                decoration: InputDecoration(
                                  hintText: canProcessInquiry
                                      ? '관리자 메모를 입력하세요.'
                                      : '본인에게 배정된 문의만 메모를 수정할 수 있습니다.',
                                ),
                              ),
                              const SizedBox(height: 12),
                              Align(
                                alignment: Alignment.centerRight,
                                child: FilledButton(
                                  onPressed: _isSaving || !canProcessInquiry
                                      ? null
                                      : _saveMemo,
                                  child: Text(_isSaving ? '저장 중' : '저장'),
                                ),
                              ),
                              if (_memoSaved) ...[
                                const SizedBox(height: 8),
                                const Text(
                                  '저장되었습니다.',
                                  style: TextStyle(fontWeight: FontWeight.w900),
                                ),
                              ],
                            ]),
                            _consultationHistory(inquiry),
                            _previousInquiriesPanel(inquiry),
                            _customerConnectionPanel(inquiry),
                          ],
                        ),
        ),
      ),
    );
  }
}
