import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/website_content.dart';
import '../services/api_client.dart';
import '../services/website_content_service.dart';
import 'website_document_list_screen.dart';
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
      final loadedSections = await widget.service.sections();
      final performanceAssets =
          loadedSections.any((item) => item.key == 'performance')
              ? await widget.service.assets('performance')
              : <WebsiteAsset>[];
      sections = loadedSections.expand((section) {
        if (section.key != 'performance') return [section];
        return [
          _performanceSummary(
              section, 'performance-videos', '성능 시연 영상', performanceAssets),
          _performanceSummary(
              section, 'performance-documents', '기술 자료', performanceAssets),
        ];
      }).toList();
    } catch (cause) {
      error = cause is ApiException
          ? cause.message
          : '홈페이지 관리 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  WebsiteSectionSummary _performanceSummary(
    WebsiteSectionSummary source,
    String key,
    String title,
    List<WebsiteAsset> assets,
  ) {
    final slots = websiteImageSlots[key] ?? const <ImageSlot>[];
    final slotKeys = slots.map((slot) => slot.key).toSet();
    final registered =
        assets.where((asset) => slotKeys.contains(asset.itemKey)).length;
    final status = registered == 0
        ? '미등록'
        : registered >= slots.length
            ? '등록 완료'
            : '일부 등록';
    return WebsiteSectionSummary(
      key: key,
      title: title,
      requiredCount: slots.length,
      registeredCount: registered,
      status: status,
      updatedAt: source.updatedAt,
      updatedByName: source.updatedByName,
    );
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
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.cloud_off,
                              size: 44, color: Color(0xFF667085)),
                          const SizedBox(height: 14),
                          Text(error!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 17)),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: _load,
                            icon: const Icon(Icons.refresh),
                            label: const Text('다시 시도'),
                          ),
                        ],
                      ),
                    ),
                  )
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
                                                      builder: (_) => section
                                                                  .key ==
                                                              'performance-documents'
                                                          ? WebsiteDocumentListScreen(
                                                              service: widget
                                                                  .service)
                                                          : WebsiteSectionScreen(
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
