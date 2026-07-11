import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/colors.dart';
import '../models/inquiry.dart';
import '../services/inquiry_service.dart';
import '../widgets/loading_view.dart';
import '../widgets/status_chip.dart';

class InquiryDetailScreen extends StatefulWidget {
  const InquiryDetailScreen({
    required this.inquiryId,
    required this.inquiryService,
    super.key,
  });

  final String inquiryId;
  final InquiryService inquiryService;

  @override
  State<InquiryDetailScreen> createState() => _InquiryDetailScreenState();
}

class _InquiryDetailScreenState extends State<InquiryDetailScreen> {
  Inquiry? _inquiry;
  bool _isLoading = true;
  bool _isSaving = false;
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
    setState(() => _isLoading = true);
    final inquiry = await widget.inquiryService.fetchInquiry(widget.inquiryId);
    setState(() {
      _inquiry = inquiry;
      _memoController.text = inquiry.adminMemo ?? '';
      _isLoading = false;
    });
  }

  Future<void> _updateStatus() async {
    final inquiry = _inquiry;
    if (inquiry == null) return;

    final nextStatus = inquiry.status == InquiryStatus.pending
        ? InquiryStatus.completed
        : InquiryStatus.pending;

    final updated = await widget.inquiryService.updateInquiry(
      inquiry.id,
      status: nextStatus,
    );

    setState(() => _inquiry = updated);
    _showSnack('상태가 변경되었습니다.');
  }

  Future<void> _saveMemo() async {
    final inquiry = _inquiry;
    if (inquiry == null) return;

    setState(() => _isSaving = true);
    final updated = await widget.inquiryService.updateInquiry(
      inquiry.id,
      adminMemo: _memoController.text,
    );
    setState(() {
      _inquiry = updated;
      _isSaving = false;
    });
    _showSnack('메모가 저장되었습니다.');
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _launch(String scheme, String? value) async {
    if (value == null || value.isEmpty) return;
    await launchUrl(Uri.parse('$scheme:$value'));
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

  Widget _row(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: const TextStyle(color: AppColors.subText)),
          ),
          Expanded(child: Text(value?.isNotEmpty == true ? value! : '-')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final inquiry = _inquiry;

    return Scaffold(
      appBar: AppBar(title: const Text('문의 상세')),
      body: _isLoading || inquiry == null
          ? const LoadingView()
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _section('기본 정보', [
                  _row('접수 시간', DateFormat('yyyy.MM.dd HH:mm').format(inquiry.createdAt.toLocal())),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const SizedBox(width: 110, child: Text('처리 상태')),
                        StatusChip(status: inquiry.status),
                      ],
                    ),
                  ),
                  _row('회사명', inquiry.companyName),
                  _row('담당자명', inquiry.contactPerson),
                  _row('이메일', inquiry.email),
                  _row('연락처', inquiry.phone),
                ]),
                _section('문의 조건', [
                  _row('국가/지역', inquiry.country),
                  _row('산업 분야', inquiry.industry),
                  _row('현재 팔레트', inquiry.currentPalletType),
                  _row('관심 제품', inquiry.productInterest),
                  _row('예상 수량', inquiry.estimatedQuantity),
                  _row('수출 국가', inquiry.exportCountry),
                ]),
                _section('문의 내용', [
                  Text(inquiry.message?.isNotEmpty == true ? inquiry.message! : '-'),
                ]),
                _section('관리자 메모', [
                  TextField(
                    controller: _memoController,
                    minLines: 3,
                    maxLines: 6,
                    decoration: const InputDecoration(hintText: '관리자 메모를 입력하세요.'),
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _isSaving ? null : _saveMemo,
                    child: Text(_isSaving ? '저장 중...' : '메모 저장'),
                  ),
                ]),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton(
                      onPressed: inquiry.phone?.isNotEmpty == true
                          ? () => _launch('tel', inquiry.phone)
                          : null,
                      child: const Text('전화하기'),
                    ),
                    OutlinedButton(
                      onPressed: inquiry.email?.isNotEmpty == true
                          ? () => _launch('mailto', inquiry.email)
                          : null,
                      child: const Text('이메일 보내기'),
                    ),
                    FilledButton(
                      onPressed: _updateStatus,
                      child: Text(
                        inquiry.status == InquiryStatus.pending
                            ? '처리 완료로 변경'
                            : '처리 전으로 되돌리기',
                      ),
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}
