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
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
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

  String _detailLabel(String key) {
    const labels = {
      'requiredPalletSize': '필요 규격',
      'deliveryRegion': '납품 지역·국가',
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

    return Scaffold(
      appBar: AppBar(title: const Text('문의 상세')),
      body: SafeArea(
        top: false,
        child: _isLoading || inquiry == null
            ? const LoadingView()
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                children: [
                  _section('기본 정보', [
                    _row(
                        '접수 시간',
                        DateFormat('yyyy.MM.dd HH:mm')
                            .format(inquiry.createdAt.toLocal())),
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
                    _row('부서·직책', inquiry.department),
                    _row('문의 유형', inquiryTypeLabel(inquiry.inquiryType)),
                    _row('이메일', inquiry.email),
                    _row('연락처', inquiry.phone),
                    _row('회신 방법', _responseMethodLabel(inquiry.responseMethod)),
                  ]),
                  _section('문의 조건', [
                    _row('산업 분야', inquiry.industry),
                    _row('화물 종류', inquiry.cargoType),
                    _row('팔레트당 중량', inquiry.loadPerPallet),
                    _row('예상 수량', inquiry.estimatedQuantity),
                    _row('필요 규격', inquiry.requiredPalletSize),
                    _row('수출 목적국', inquiry.exportCountry),
                    _row('랙 적재', _booleanLabel(inquiry.rackStorage)),
                    _row('자동화 설비', _booleanLabel(inquiry.automationUse)),
                    _row('지게차 사용', _booleanLabel(inquiry.forkliftUse)),
                    _row('핸드파레트', _booleanLabel(inquiry.handPalletTruckUse)),
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
                            onPressed:
                                attachment.downloadUrl?.isNotEmpty == true
                                    ? () => launchUrl(
                                          Uri.parse(attachment.downloadUrl!),
                                          mode: LaunchMode.externalApplication,
                                        )
                                    : null,
                            icon: const Icon(Icons.attach_file, size: 20),
                            label: Text(attachment.fileName),
                          ),
                        ),
                      ),
                    ]),
                  _section('관리자 메모', [
                    TextField(
                      controller: _memoController,
                      minLines: 3,
                      maxLines: 6,
                      decoration:
                          const InputDecoration(hintText: '관리자 메모를 입력하세요.'),
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: FilledButton(
                        onPressed: _isSaving ? null : _saveMemo,
                        child: Text(_isSaving ? '저장 중...' : '메모 저장'),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      OutlinedButton.icon(
                        onPressed: inquiry.phone?.isNotEmpty == true
                            ? () => _launch('tel', inquiry.phone)
                            : null,
                        icon: const Icon(Icons.phone, size: 22),
                        label: const Text('전화하기'),
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
      ),
    );
  }
}
