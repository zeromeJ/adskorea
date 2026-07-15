import 'package:flutter/material.dart';
import '../models/website_content.dart';
import '../services/website_content_service.dart';
import 'website_section_screen.dart';

class WebsiteDocumentListScreen extends StatefulWidget {
  const WebsiteDocumentListScreen({required this.service, super.key});

  final WebsiteContentService service;

  @override
  State<WebsiteDocumentListScreen> createState() =>
      _WebsiteDocumentListScreenState();
}

class _WebsiteDocumentListScreenState extends State<WebsiteDocumentListScreen> {
  bool loading = true;
  String? error;
  List<WebsiteAsset> assets = [];
  List<Map<String, dynamic>> documents = [];

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
      final content = await widget.service.content('performance');
      assets = content.assets;
      final stored = content.data['documents'];
      documents = List.generate(websiteDocumentDefaults.length, (index) {
        final item =
            stored is List && stored.length > index && stored[index] is Map
                ? Map<String, dynamic>.from(stored[index] as Map)
                : <String, dynamic>{};
        return {...websiteDocumentDefaults[index], ...item};
      });
    } catch (cause) {
      error = '기술자료 정보를 불러오지 못했습니다.\n$cause';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  bool _has(String itemKey) => assets.any((asset) => asset.itemKey == itemKey);

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('기술 자료')),
        body: loading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(error!, textAlign: TextAlign.center),
                          const SizedBox(height: 16),
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
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        const Text('관리할 문서를 선택하세요.',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        const Text('문서 정보와 원본·번역본 PDF, 썸네일을 문서별로 관리합니다.'),
                        const SizedBox(height: 18),
                        ...documents.asMap().entries.map((entry) {
                          final index = entry.key;
                          final document = entry.value;
                          final original = _has('document${index + 1}File');
                          final translated =
                              _has('document${index + 1}TranslatedFile');
                          final thumbnail = _has('document${index + 1}');
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => WebsiteSectionScreen(
                                      service: widget.service,
                                      summary: WebsiteSectionSummary(
                                        key: 'performance-documents',
                                        title: document['title']?.toString() ??
                                            '기술자료 ${index + 1}',
                                        requiredCount: 1,
                                        registeredCount: original ? 1 : 0,
                                        status: original ? '등록 완료' : '미등록',
                                      ),
                                      slotsOverride:
                                          websiteDocumentSlots(index),
                                      documentIndex: index,
                                    ),
                                  ),
                                );
                                await _load();
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${index + 1}. ${document['title']}',
                                      style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800),
                                    ),
                                    const SizedBox(height: 10),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: [
                                        _StatusChip(
                                            label: '원본 PDF',
                                            registered: original),
                                        _StatusChip(
                                            label: '번역본 PDF',
                                            registered: translated),
                                        _StatusChip(
                                            label: '썸네일',
                                            registered: thumbnail),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    const Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text('문서 관리',
                                            style: TextStyle(
                                                color: Color(0xFF164B32),
                                                fontWeight: FontWeight.w800)),
                                        SizedBox(width: 4),
                                        Icon(Icons.chevron_right,
                                            color: Color(0xFF164B32)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
      );
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.label, required this.registered});

  final String label;
  final bool registered;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: registered ? const Color(0xFFE8F3EC) : const Color(0xFFF0F1EE),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          '$label · ${registered ? '등록' : '미등록'}',
          style: TextStyle(
            color:
                registered ? const Color(0xFF28734A) : const Color(0xFF667085),
            fontWeight: FontWeight.w700,
          ),
        ),
      );
}
