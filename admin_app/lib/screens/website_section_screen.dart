import 'dart:typed_data';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../models/website_content.dart';
import '../services/website_content_service.dart';
import '../widgets/image_editor_dialog.dart';

class WebsiteSectionScreen extends StatefulWidget {
  const WebsiteSectionScreen(
      {required this.service,
      required this.summary,
      this.slotsOverride,
      this.documentIndex,
      super.key});
  final WebsiteContentService service;
  final WebsiteSectionSummary summary;
  final List<ImageSlot>? slotsOverride;
  final int? documentIndex;
  @override
  State<WebsiteSectionScreen> createState() => _WebsiteSectionScreenState();
}

class _WebsiteSectionScreenState extends State<WebsiteSectionScreen> {
  final picker = ImagePicker();
  bool loading = true, saving = false, dirty = false;
  String? error;
  List<WebsiteAsset> assets = [];
  final Map<String, PendingImageEdit> pending = {};
  final Map<String, PendingFileUpload> pendingFiles = {};
  final Set<String> deleted = {};
  final Map<String, TextEditingController> documentControllers = {};
  final Map<String, TextEditingController> summaryControllers = {};
  Map<String, dynamic> summaryStructure = {};
  bool summaryPublished = false;
  Map<String, dynamic> sectionData = {};
  List<ImageSlot> get slots =>
      widget.slotsOverride ?? websiteImageSlots[widget.summary.key] ?? const [];
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final controller in documentControllers.values) {
      controller.dispose();
    }
    for (final controller in summaryControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _setDocumentControllers(Map<String, dynamic> values) {
    for (final controller in documentControllers.values) {
      controller.dispose();
    }
    documentControllers.clear();
    for (final key in const [
      'title',
      'documentType',
      'issuer',
      'reportNumber',
      'issueDate',
      'expiryDate',
      'relatedProducts',
      'language',
    ]) {
      documentControllers[key] =
          TextEditingController(text: values[key]?.toString() ?? '');
    }
    _setSummaryControllers(values['koreanSummary']);
  }

  void _setSummaryControllers(dynamic rawSummary) {
    for (final controller in summaryControllers.values) {
      controller.dispose();
    }
    summaryControllers.clear();
    summaryStructure = rawSummary is Map
        ? Map<String, dynamic>.from(rawSummary)
        : <String, dynamic>{};
    summaryPublished = summaryStructure['published'] == true;

    void add(String key, dynamic value) {
      summaryControllers[key] =
          TextEditingController(text: value?.toString() ?? '');
    }

    for (final field in const ['overview', 'environment']) {
      final items = summaryStructure[field];
      if (items is! List) continue;
      for (var index = 0; index < items.length; index++) {
        final item = items[index];
        if (item is! Map) continue;
        add('$field.$index.label', item['label']);
        add('$field.$index.value', item['value']);
      }
    }
    final results = summaryStructure['results'];
    if (results is List) {
      for (var index = 0; index < results.length; index++) {
        final item = results[index];
        if (item is! Map) continue;
        for (final key in const ['name', 'standard', 'value', 'judgement']) {
          add('results.$index.$key', item[key]);
        }
      }
    }
    for (final field in const [
      'testStandards',
      'verificationScope',
      'cautions'
    ]) {
      final items = summaryStructure[field];
      if (items is! List) continue;
      for (var index = 0; index < items.length; index++) {
        add('$field.$index', items[index]);
      }
    }
    final highlight = summaryStructure['highlight'];
    if (highlight is Map) {
      add('highlight.label', highlight['label']);
      add('highlight.value', highlight['value']);
    }
    final lifecycle = summaryStructure['lifecycleStages'];
    if (lifecycle is List) {
      for (var index = 0; index < lifecycle.length; index++) {
        final item = lifecycle[index];
        if (item is! Map) continue;
        add('lifecycleStages.$index.label', item['label']);
        add('lifecycleStages.$index.value', item['value']);
      }
    }
  }

  Map<String, dynamic> _summaryData() {
    List<Map<String, String>> pairs(String field) {
      final source = summaryStructure[field];
      if (source is! List) return [];
      return List.generate(
          source.length,
          (index) => {
                'label': summaryControllers['$field.$index.label']!.text.trim(),
                'value': summaryControllers['$field.$index.value']!.text.trim(),
              });
    }

    List<String> strings(String field) {
      final source = summaryStructure[field];
      if (source is! List) return [];
      return List.generate(source.length,
          (index) => summaryControllers['$field.$index']!.text.trim());
    }

    final resultSource = summaryStructure['results'];
    final results = resultSource is List
        ? List.generate(
            resultSource.length,
            (index) => {
                  for (final key in const [
                    'name',
                    'standard',
                    'value',
                    'judgement'
                  ])
                    key: summaryControllers['results.$index.$key']!.text.trim(),
                })
        : <Map<String, String>>[];
    final lifecycleSource = summaryStructure['lifecycleStages'];
    final lifecycle = lifecycleSource is List
        ? List.generate(
            lifecycleSource.length,
            (index) => {
                  'label': summaryControllers['lifecycleStages.$index.label']!
                      .text
                      .trim(),
                  'value': double.tryParse(
                          summaryControllers['lifecycleStages.$index.value']!
                              .text
                              .trim()) ??
                      0,
                })
        : <Map<String, dynamic>>[];
    return {
      'published': summaryPublished,
      'kind': summaryStructure['kind']?.toString() ?? 'test',
      'overview': pairs('overview'),
      'results': results,
      'testStandards': strings('testStandards'),
      'environment': pairs('environment'),
      'verificationScope': strings('verificationScope'),
      'cautions': strings('cautions'),
      if (summaryStructure['highlight'] is Map)
        'highlight': {
          'label': summaryControllers['highlight.label']!.text.trim(),
          'value': summaryControllers['highlight.value']!.text.trim(),
        },
      if (lifecycleSource is List) 'lifecycleStages': lifecycle,
    };
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final content = await widget.service
          .content(websiteStorageSectionKey(widget.summary.key));
      assets = content.assets;
      sectionData = content.data;
      final documentIndex = widget.documentIndex;
      if (documentIndex != null) {
        final storedDocuments = sectionData['documents'];
        final stored = storedDocuments is List &&
                storedDocuments.length > documentIndex &&
                storedDocuments[documentIndex] is Map
            ? Map<String, dynamic>.from(storedDocuments[documentIndex] as Map)
            : <String, dynamic>{};
        _setDocumentControllers({
          ...websiteDocumentDefaults[documentIndex],
          ...stored,
        });
      }
      pending.clear();
      pendingFiles.clear();
      deleted.clear();
      dirty = false;
    } catch (_) {
      error = '등록 정보를 불러오지 못했습니다.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _chooseFile(ImageSlot slot) async {
    final isPdf = slot.type == WebsiteSlotType.pdf;
    late final Uint8List bytes;
    late final String fileName;
    String? extension;
    if (isPdf) {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['pdf'],
        withData: true,
      );
      if (result == null || result.files.isEmpty) return;
      final selected = result.files.single;
      final selectedBytes = selected.bytes ??
          (selected.path == null
              ? null
              : await File(selected.path!).readAsBytes());
      if (selectedBytes == null) return;
      bytes = selectedBytes;
      fileName = selected.name;
      extension = selected.extension?.toLowerCase();
    } else {
      final selected = await picker.pickVideo(source: ImageSource.gallery);
      if (selected == null) return;
      bytes = await selected.readAsBytes();
      fileName = selected.name;
      extension = fileName.split('.').last.toLowerCase();
    }
    final maxBytes = isPdf ? 30 * 1024 * 1024 : 50 * 1024 * 1024;
    if (bytes.length > maxBytes) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(isPdf
                ? 'PDF는 30MB 이하만 등록할 수 있습니다.'
                : '영상은 50MB 이하만 등록할 수 있습니다.')));
      }
      return;
    }
    final mimeType = isPdf
        ? 'application/pdf'
        : extension == 'webm'
            ? 'video/webm'
            : extension == 'mov'
                ? 'video/quicktime'
                : 'video/mp4';
    if (!mounted) return;
    setState(() {
      pendingFiles[slot.key] = PendingFileUpload(
          bytes: bytes, fileName: fileName, mimeType: mimeType);
      deleted.remove(slot.key);
      dirty = true;
    });
  }

  WebsiteAsset? _asset(String key) {
    for (final asset in assets) {
      if (asset.itemKey == key && !deleted.contains(key)) return asset;
    }
    return null;
  }

  Future<void> _choose(ImageSlot slot, {bool existing = false}) async {
    Uint8List? bytes;
    String fileName;
    List<double>? initialCrop;
    double initialZoom = 1;
    int initialRotation = 0;
    if (existing) {
      final local = pending[slot.key];
      if (local != null) {
        bytes = local.original;
        fileName = local.fileName;
        initialCrop = local.crop;
        initialZoom = local.zoom;
        initialRotation = local.rotation;
      } else {
        final current = _asset(slot.key);
        final url = current?.originalUrl ?? current?.url;
        if (url == null) return;
        final response = await http.get(Uri.parse(url));
        bytes = response.bodyBytes;
        fileName =
            current?.data['originalFileName'] as String? ?? '${slot.key}.jpg';
        initialCrop = [
          (current?.data['cropX'] as num?)?.toDouble() ?? 0,
          (current?.data['cropY'] as num?)?.toDouble() ?? 0,
          (current?.data['cropWidth'] as num?)?.toDouble() ?? 1,
          (current?.data['cropHeight'] as num?)?.toDouble() ?? 1,
        ];
        initialZoom = (current?.data['zoom'] as num?)?.toDouble() ?? 1;
        initialRotation = current?.data['rotation'] as int? ?? 0;
      }
    } else {
      final file = await picker.pickImage(
          source: ImageSource.gallery, imageQuality: 100);
      if (file == null) return;
      bytes = await file.readAsBytes();
      fileName = file.name;
    }
    if (!mounted) return;
    final edit = await ImageEditorDialog.open(context,
        slot: slot,
        bytes: bytes,
        fileName: fileName,
        initialCrop: initialCrop,
        initialZoom: initialZoom,
        initialRotation: initialRotation);
    if (edit != null && mounted) {
      setState(() {
        pending[slot.key] = edit;
        deleted.remove(slot.key);
        dirty = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('이미지 편집을 적용했습니다. 하단의 저장 버튼을 눌러 반영해 주세요.')));
    }
  }

  void _delete(ImageSlot slot) async {
    final yes = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
                scrollable: true,
                title: Text(slot.type == WebsiteSlotType.image
                    ? '이 이미지를 삭제하시겠습니까?'
                    : '이 파일을 삭제하시겠습니까?'),
                content: const Text('변경사항을 저장하면 홈페이지에서도 더 이상 표시되지 않습니다.'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('취소')),
                  FilledButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('삭제'))
                ]));
    if (yes == true) {
      setState(() {
        pending.remove(slot.key);
        pendingFiles.remove(slot.key);
        deleted.add(slot.key);
        dirty = true;
      });
    }
  }

  Future<void> _save() async {
    setState(() => saving = true);
    try {
      final next = assets
          .where((a) =>
              !deleted.contains(a.itemKey) &&
              !pending.containsKey(a.itemKey) &&
              !pendingFiles.containsKey(a.itemKey))
          .toList();
      if (widget.documentIndex != null) {
        next.removeWhere((asset) =>
            asset.itemKey ==
            'document${widget.documentIndex! + 1}TranslatedFile');
      }
      if (pending.containsKey('heroDesktop') ||
          deleted.contains('heroDesktop')) {
        next.removeWhere((asset) => asset.itemKey == 'heroMobile');
      }
      final storageSectionKey = websiteStorageSectionKey(widget.summary.key);
      for (final slot in slots) {
        final edit = pending[slot.key];
        if (edit != null) {
          next.add(
              await widget.service.uploadImage(storageSectionKey, slot, edit));
        }
        final file = pendingFiles[slot.key];
        if (file != null) {
          next.add(
              await widget.service.uploadFile(storageSectionKey, slot, file));
        }
      }
      Map<String, dynamic>? data;
      final documentIndex = widget.documentIndex;
      if (documentIndex != null) {
        final existing = sectionData['documents'];
        final documents = existing is List
            ? existing
                .map((item) => item is Map
                    ? Map<String, dynamic>.from(item)
                    : <String, dynamic>{})
                .toList()
            : websiteDocumentDefaults
                .map((item) => Map<String, dynamic>.from(item))
                .toList();
        while (documents.length < websiteDocumentDefaults.length) {
          documents.add(Map<String, dynamic>.from(
              websiteDocumentDefaults[documents.length]));
        }
        documents[documentIndex] = {
          for (final entry in documentControllers.entries)
            entry.key: entry.value.text.trim(),
          'koreanSummary': _summaryData(),
        };
        data = {...sectionData, 'documents': documents};
      }
      await widget.service.saveSection(storageSectionKey, next, data: data);
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('홈페이지에 반영되었습니다.')));
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('저장하지 못했습니다. 다시 시도해 주세요.\n$e')));
      }
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  Widget _buildDocumentInformation() {
    const fields = [
      ('title', '문서 제목', 1),
      ('documentType', '문서 유형', 1),
      ('issuer', '발급기관', 1),
      ('reportNumber', '문서번호', 1),
      ('issueDate', '발급일', 1),
      ('expiryDate', '유효기간', 1),
      ('relatedProducts', '적용 제품', 2),
      ('language', '언어 표시', 1),
    ];
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('문서 정보',
                style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            const Text('홈페이지 카드 옆에 표시되는 정보입니다.',
                style: TextStyle(color: Color(0xFF667085))),
            const SizedBox(height: 16),
            ...fields.map((field) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: TextField(
                    controller: documentControllers[field.$1],
                    maxLines: field.$3,
                    minLines: field.$3,
                    onChanged: (_) => setState(() => dirty = true),
                    decoration: InputDecoration(
                      labelText: field.$2,
                      alignLabelWithHint: field.$3 > 1,
                      border: const OutlineInputBorder(),
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _summaryTextField(String key, String label,
      {int lines = 1, TextInputType? keyboardType}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: summaryControllers[key],
        keyboardType: keyboardType,
        maxLines: lines,
        minLines: lines,
        onChanged: (_) => setState(() => dirty = true),
        decoration: InputDecoration(
          labelText: label,
          alignLabelWithHint: lines > 1,
          border: const OutlineInputBorder(),
        ),
      ),
    );
  }

  Widget _summaryPairList(String field, String heading) {
    final source = summaryStructure[field];
    if (source is! List || source.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(heading,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const SizedBox(height: 10),
      ...List.generate(
          source.length,
          (index) => Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                      child: _summaryTextField(
                          '$field.$index.label', '항목명 ${index + 1}')),
                  const SizedBox(width: 8),
                  Expanded(
                      flex: 2,
                      child: _summaryTextField(
                          '$field.$index.value', '내용 ${index + 1}')),
                ],
              )),
      const SizedBox(height: 8),
    ]);
  }

  Widget _summaryStringList(String field, String heading) {
    final source = summaryStructure[field];
    if (source is! List || source.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(heading,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const SizedBox(height: 10),
      ...List.generate(
          source.length,
          (index) => _summaryTextField(
              '$field.$index', '${heading.replaceAll('사항', '')} ${index + 1}',
              lines: 2)),
      const SizedBox(height: 8),
    ]);
  }

  Widget _buildSummaryInformation() {
    final results = summaryStructure['results'];
    final highlight = summaryStructure['highlight'];
    final lifecycle = summaryStructure['lifecycleStages'];
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('한국어 요약',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          const Text('HTML이나 표 코드 없이 구조화된 항목만 입력합니다.',
              style: TextStyle(color: Color(0xFF667085))),
          const SizedBox(height: 8),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            title: const Text('요약 공개',
                style: TextStyle(fontWeight: FontWeight.w800)),
            subtitle: const Text('끄면 홈페이지에 한국어 요약 버튼이 표시되지 않습니다.'),
            value: summaryPublished,
            onChanged: (value) => setState(() {
              summaryPublished = value;
              dirty = true;
            }),
          ),
          const Divider(height: 28),
          if (highlight is Map) ...[
            const Text('핵심 결과',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            _summaryTextField('highlight.label', '핵심 수치 항목명'),
            _summaryTextField('highlight.value', '핵심 수치'),
            const SizedBox(height: 8),
          ],
          _summaryPairList('overview', '문서 개요'),
          if (results is List && results.isNotEmpty) ...[
            const Text('주요 결과 목록',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            ...List.generate(
                results.length,
                (index) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F3EF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(children: [
                        _summaryTextField('results.$index.name', '시험항목'),
                        Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                  child: _summaryTextField(
                                      'results.$index.standard', '기준값')),
                              const SizedBox(width: 8),
                              Expanded(
                                  child: _summaryTextField(
                                      'results.$index.value', '시험값')),
                            ]),
                        _summaryTextField('results.$index.judgement', '판정'),
                      ]),
                    )),
            const SizedBox(height: 8),
          ],
          _summaryStringList('testStandards', '시험 기준'),
          _summaryPairList('environment', '시험 환경'),
          _summaryStringList('verificationScope', '검증 범위'),
          if (lifecycle is List && lifecycle.isNotEmpty) ...[
            const Text('생애주기 단계별 값',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            const Text('입력값으로 홈페이지 가로 막대그래프가 자동 생성됩니다.',
                style: TextStyle(color: Color(0xFF667085))),
            const SizedBox(height: 10),
            ...List.generate(
                lifecycle.length,
                (index) => Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                            child: _summaryTextField(
                                'lifecycleStages.$index.label', '단계명')),
                        const SizedBox(width: 8),
                        Expanded(
                            child: _summaryTextField(
                                'lifecycleStages.$index.value', 'kg CO₂e',
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                        signed: true, decimal: true))),
                      ],
                    )),
            const SizedBox(height: 8),
          ],
          _summaryStringList('cautions', '주의사항'),
        ]),
      ),
    );
  }

  Widget _buildFileCard(int index, ImageSlot slot, WebsiteAsset? current) {
    final pendingFile = pendingFiles[slot.key];
    final isPdf = slot.type == WebsiteSlotType.pdf;
    final fileName =
        pendingFile?.fileName ?? current?.data['originalFileName'] as String?;
    final size = pendingFile?.bytes.length ?? current?.data['size'] as int?;
    final sizeLabel = size == null
        ? null
        : size >= 1024 * 1024
            ? '${(size / 1024 / 1024).toStringAsFixed(1)}MB'
            : '${(size / 1024).toStringAsFixed(0)}KB';
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${index + 1}. ${slot.label}',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(slot.description,
                style: const TextStyle(color: Color(0xFF667085))),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F3EF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(children: [
                Icon(isPdf ? Icons.picture_as_pdf : Icons.video_file,
                    size: 34, color: const Color(0xFF164B32)),
                const SizedBox(width: 12),
                Expanded(
                  child: fileName == null
                      ? Text(isPdf ? '등록된 PDF 없음' : '등록된 영상 없음')
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(fileName,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700)),
                            if (sizeLabel != null)
                              Text(sizeLabel,
                                  style: const TextStyle(
                                      color: Color(0xFF667085))),
                          ],
                        ),
                ),
              ]),
            ),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: [
              FilledButton.icon(
                onPressed: () => _chooseFile(slot),
                icon: const Icon(Icons.upload_file),
                label: Text(fileName == null ? '파일 선택' : '파일 교체'),
              ),
              if (fileName != null)
                OutlinedButton.icon(
                  onPressed: () => _delete(slot),
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('삭제'),
                ),
            ]),
          ],
        ),
      ),
    );
  }

  Future<bool> _canLeave() async {
    if (!dirty) return true;
    return await showDialog<bool>(
            context: context,
            builder: (_) => AlertDialog(
                    scrollable: true,
                    title: const Text('저장하지 않은 변경사항이 있습니다.'),
                    content: const Text('저장하지 않고 페이지를 나가시겠습니까?'),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('계속 편집')),
                      FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('나가기'))
                    ])) ??
        false;
  }

  Future<void> _cancel() async {
    if (saving) return;
    if (widget.documentIndex != null) {
      if (await _canLeave() && mounted) {
        Navigator.pop(context);
      }
      return;
    }
    if (dirty) await _load();
  }

  @override
  Widget build(BuildContext context) => PopScope(
      canPop: !dirty,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop && await _canLeave() && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(
            title: Text(widget.summary.title,
                maxLines: 1, overflow: TextOverflow.ellipsis)),
        bottomNavigationBar: SafeArea(
            child: Container(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Color(0xFFE0E2DD)))),
                child: Row(children: [
                  Expanded(
                      child: OutlinedButton(
                          onPressed:
                              !saving && (widget.documentIndex != null || dirty)
                                  ? _cancel
                                  : null,
                          child: const Text('취소', maxLines: 1))),
                  const SizedBox(width: 8),
                  Expanded(
                      flex: 2,
                      child: FilledButton.icon(
                          onPressed: dirty && !saving ? _save : null,
                          icon: saving
                              ? const SizedBox.square(
                                  dimension: 18,
                                  child:
                                      CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.save),
                          label: const Text('저장', maxLines: 1)))
                ]))),
        body: loading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(child: Text(error!))
                : ListView(padding: const EdgeInsets.all(16), children: [
                    if (dirty)
                      Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                              color: const Color(0xFFFFF4D6),
                              borderRadius: BorderRadius.circular(8)),
                          child: const Text('저장되지 않은 변경사항이 있습니다.',
                              style: TextStyle(fontWeight: FontWeight.w800))),
                    if (widget.documentIndex != null)
                      _buildDocumentInformation(),
                    if (widget.documentIndex != null)
                      _buildSummaryInformation(),
                    if (slots.isEmpty)
                      const Card(
                          child: Padding(
                              padding: EdgeInsets.all(20),
                              child: Text('이 영역의 텍스트와 파일 관리 항목을 준비하고 있습니다.'))),
                    ...slots.asMap().entries.map((entry) {
                      final slot = entry.value;
                      final current = _asset(slot.key);
                      if (slot.type != WebsiteSlotType.image) {
                        return _buildFileCard(entry.key, slot, current);
                      }
                      final local = pending[slot.key];
                      return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Card(
                                margin: const EdgeInsets.only(bottom: 14),
                                child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                              '${entry.key + 1}. ${slot.label}',
                                              style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w800)),
                                          const SizedBox(height: 6),
                                          Text(
                                              '권장 비율 ${slot.ratio} · 권장 크기 ${slot.width}×${slot.height}px'),
                                          const SizedBox(height: 4),
                                          Text(slot.description,
                                              style: const TextStyle(
                                                  color: Color(0xFF667085))),
                                          const SizedBox(height: 12),
                                          AspectRatio(
                                              aspectRatio: slot.aspect,
                                              child: ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                  child: local != null
                                                      ? Image.memory(
                                                          local.edited,
                                                          fit: BoxFit.cover)
                                                      : current?.url != null
                                                          ? Image.network(
                                                              current!.url!,
                                                              fit: BoxFit.cover,
                                                              errorBuilder: (_,
                                                                      __,
                                                                      ___) =>
                                                                  const Center(
                                                                      child: Text(
                                                                          '미리보기를 불러오지 못했습니다.')))
                                                          : Container(
                                                              color: const Color(
                                                                  0xFFF1F3EF),
                                                              alignment:
                                                                  Alignment
                                                                      .center,
                                                              child: const Text(
                                                                  '등록된 파일 없음')))),
                                          const SizedBox(height: 12),
                                          if (local != null)
                                            Container(
                                                width: double.infinity,
                                                padding:
                                                    const EdgeInsets.all(10),
                                                decoration: BoxDecoration(
                                                    color:
                                                        const Color(0xFFFFF4D6),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8)),
                                                child: Text(
                                                    '저장 대기 · ${local.fileName}\n하단의 저장 버튼을 눌러야 반영됩니다.',
                                                    maxLines: 3,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w700))),
                                          const SizedBox(height: 10),
                                          Wrap(
                                              spacing: 8,
                                              runSpacing: 8,
                                              children: [
                                                FilledButton.icon(
                                                    onPressed: () =>
                                                        _choose(slot),
                                                    icon: const Icon(
                                                        Icons.photo_library),
                                                    label: Text(
                                                        current == null &&
                                                                local == null
                                                            ? '파일 선택'
                                                            : '파일 교체')),
                                                if (current != null ||
                                                    local != null)
                                                  OutlinedButton.icon(
                                                      onPressed: () => _choose(
                                                          slot,
                                                          existing: true),
                                                      icon: const Icon(
                                                          Icons.crop),
                                                      label:
                                                          const Text('다시 편집')),
                                                if (current != null ||
                                                    local != null)
                                                  OutlinedButton.icon(
                                                      onPressed: () =>
                                                          _delete(slot),
                                                      icon: const Icon(
                                                          Icons.delete_outline),
                                                      label: const Text('삭제')),
                                              ]),
                                        ]))),
                          ]);
                    }),
                    const SizedBox(height: 80),
                  ]),
      ));
}
