import 'package:flutter/material.dart';
import '../models/inquiry.dart';
import '../services/api_client.dart';
import '../services/inquiry_service.dart';

class ConsultationRecordScreen extends StatefulWidget {
  const ConsultationRecordScreen({
    required this.inquiryId,
    required this.service,
    super.key,
  });

  final String inquiryId;
  final InquiryService service;

  @override
  State<ConsultationRecordScreen> createState() =>
      _ConsultationRecordScreenState();
}

class _ConsultationRecordScreenState extends State<ConsultationRecordScreen> {
  final _memoController = TextEditingController();
  InquiryConsultationResult? _result;
  bool _saving = false;
  bool _saved = false;

  bool get _dirty => _result != null || _memoController.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    _memoController.addListener(_refresh);
  }

  @override
  void dispose() {
    _memoController
      ..removeListener(_refresh)
      ..dispose();
    super.dispose();
  }

  void _refresh() => setState(() => _saved = false);

  Future<bool> _canLeave() async {
    if (!_dirty || _saved) return true;
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

  Future<void> _save() async {
    if (_result == null || _saving) return;
    setState(() => _saving = true);
    try {
      await widget.service.addConsultationRecord(
        widget.inquiryId,
        result: _result!,
        memo: _memoController.text,
      );
      if (!mounted) return;
      setState(() => _saved = true);
      await Future<void>.delayed(const Duration(milliseconds: 500));
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_dirty || _saved,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _canLeave() && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('상담 기록')),
        bottomNavigationBar: SafeArea(
          minimum: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_saved) ...[
                const Text(
                  '저장되었습니다.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
              ],
              FilledButton(
                onPressed: _result == null || _saving ? null : _save,
                child: Text(_saving ? '저장 중' : '저장'),
              ),
            ],
          ),
        ),
        body: RadioGroup<InquiryConsultationResult>(
          groupValue: _result,
          onChanged:
              _saving ? (_) {} : (value) => setState(() => _result = value),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                '처리 결과',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 6),
              const Text('먼저 가장 가까운 결과를 하나 선택하세요.'),
              const SizedBox(height: 12),
              ...InquiryConsultationResult.values.map(
                (result) => Card(
                  elevation: 0,
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap:
                        _saving ? null : () => setState(() => _result = result),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(minHeight: 58),
                      child: Row(
                        children: [
                          Radio<InquiryConsultationResult>(value: result),
                          Expanded(
                            child: Text(
                              inquiryConsultationResultLabel(result),
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                '추가 메모 (선택)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _memoController,
                enabled: !_saving,
                minLines: 4,
                maxLines: 8,
                decoration: const InputDecoration(
                  hintText: '필요한 내용만 입력하세요.',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
