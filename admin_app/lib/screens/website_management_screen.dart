import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/website_content.dart';
import '../services/website_content_service.dart';
import 'website_section_screen.dart';

class WebsiteManagementScreen extends StatefulWidget {
  const WebsiteManagementScreen({required this.service, super.key});
  final WebsiteContentService service;
  @override
  State<WebsiteManagementScreen> createState() =>
      _WebsiteManagementScreenState();
}

class _WebsiteManagementScreenState extends State<WebsiteManagementScreen> {
  bool loading = true;
  String? error;
  List<WebsiteSectionSummary> sections = [];
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      sections = await widget.service.sections();
    } catch (_) {
      error = '홈페이지 관리 정보를 불러오지 못했습니다.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Color _statusColor(String status) => status == '등록 완료'
      ? const Color(0xFF28734A)
      : status == '일부 등록'
          ? const Color(0xFF9A6700)
          : const Color(0xFF667085);
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('홈페이지 관리')),
        body: loading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: FilledButton(onPressed: _load, child: Text(error!)))
                : RefreshIndicator(
                    onRefresh: _load,
                    child:
                        ListView(padding: const EdgeInsets.all(16), children: [
                      const Text('수정할 홈페이지 영역을 선택하세요.',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      const Text(
                          '각 영역은 따로 저장됩니다. 저장 버튼을 누르기 전에는 홈페이지가 바뀌지 않습니다.'),
                      const SizedBox(height: 18),
                      ...sections.map((section) => Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(children: [
                                      Expanded(
                                          child: Text(section.title,
                                              style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight:
                                                      FontWeight.w800))),
                                      Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                              color:
                                                  _statusColor(section.status)
                                                      .withValues(alpha: .1),
                                              borderRadius:
                                                  BorderRadius.circular(6)),
                                          child: Text(section.status,
                                              style: TextStyle(
                                                  color: _statusColor(
                                                      section.status),
                                                  fontWeight: FontWeight.w800)))
                                    ]),
                                    const SizedBox(height: 10),
                                    Text(
                                        '필요 ${section.requiredCount}개 / 등록 ${section.registeredCount}개',
                                        style: const TextStyle(fontSize: 16)),
                                    if (section.updatedAt != null)
                                      Padding(
                                          padding:
                                              const EdgeInsets.only(top: 5),
                                          child: Text(
                                              '마지막 수정: ${DateFormat('yyyy.MM.dd HH:mm').format(section.updatedAt!.toLocal())}${section.updatedByName == null ? '' : ' · ${section.updatedByName}'}',
                                              style: const TextStyle(
                                                  color: Color(0xFF667085)))),
                                    const SizedBox(height: 14),
                                    SizedBox(
                                        width: double.infinity,
                                        child: FilledButton.icon(
                                            onPressed: () async {
                                              await Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (_) =>
                                                          WebsiteSectionScreen(
                                                              service: widget
                                                                  .service,
                                                              summary:
                                                                  section)));
                                              _load();
                                            },
                                            icon: const Icon(Icons.edit),
                                            label: const Text('관리하기'))),
                                  ])))),
                    ]),
                  ),
      );
}
