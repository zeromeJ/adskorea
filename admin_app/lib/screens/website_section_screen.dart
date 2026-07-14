import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../models/website_content.dart';
import '../services/website_content_service.dart';
import '../widgets/image_editor_dialog.dart';

class WebsiteSectionScreen extends StatefulWidget {
  const WebsiteSectionScreen(
      {required this.service, required this.summary, super.key});
  final WebsiteContentService service;
  final WebsiteSectionSummary summary;
  @override
  State<WebsiteSectionScreen> createState() => _WebsiteSectionScreenState();
}

class _WebsiteSectionScreenState extends State<WebsiteSectionScreen> {
  final picker = ImagePicker();
  bool loading = true, saving = false, dirty = false;
  String? error;
  List<WebsiteAsset> assets = [];
  final Map<String, PendingImageEdit> pending = {};
  final Set<String> deleted = {};
  List<ImageSlot> get slots =>
      websiteImageSlots[widget.summary.key] ?? const [];
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
      assets = await widget.service.assets(widget.summary.key);
      pending.clear();
      deleted.clear();
      dirty = false;
    } catch (_) {
      error = '등록 정보를 불러오지 못했습니다.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
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
    }
  }

  void _delete(ImageSlot slot) async {
    final yes = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
                title: const Text('이 이미지를 삭제하시겠습니까?'),
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
              !deleted.contains(a.itemKey) && !pending.containsKey(a.itemKey))
          .toList();
      for (final slot in slots) {
        final edit = pending[slot.key];
        if (edit != null) {
          next.add(
              await widget.service.uploadImage(widget.summary.key, slot, edit));
        }
      }
      await widget.service.saveSection(widget.summary.key, next);
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

  Future<bool> _canLeave() async {
    if (!dirty) return true;
    return await showDialog<bool>(
            context: context,
            builder: (_) => AlertDialog(
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

  @override
  Widget build(BuildContext context) => PopScope(
      canPop: !dirty,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop && await _canLeave() && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(title: Text(widget.summary.title)),
        bottomNavigationBar: SafeArea(
            child: Container(
                padding: const EdgeInsets.all(14),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Color(0xFFE0E2DD)))),
                child: Row(children: [
                  Expanded(
                      child: OutlinedButton(
                          onPressed: dirty && !saving ? _load : null,
                          child: const Text('변경 취소'))),
                  const SizedBox(width: 10),
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
                          label: const Text('변경사항 저장')))
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
                    if (slots.isEmpty)
                      const Card(
                          child: Padding(
                              padding: EdgeInsets.all(20),
                              child: Text('이 영역의 텍스트와 파일 관리 항목을 준비하고 있습니다.'))),
                    ...slots.asMap().entries.map((entry) {
                      final slot = entry.value;
                      final current = _asset(slot.key);
                      final local = pending[slot.key];
                      return Card(
                          margin: const EdgeInsets.only(bottom: 14),
                          child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('${entry.key + 1}. ${slot.label}',
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
                                                ? Image.memory(local.edited,
                                                    fit: BoxFit.cover)
                                                : current?.url != null
                                                    ? Image.network(
                                                        current!.url!,
                                                        fit: BoxFit.cover,
                                                        errorBuilder: (_, __,
                                                                ___) =>
                                                            const Center(
                                                                child: Text(
                                                                    '미리보기를 불러오지 못했습니다.')))
                                                    : Container(
                                                        color: const Color(
                                                            0xFFF1F3EF),
                                                        alignment:
                                                            Alignment.center,
                                                        child: const Text(
                                                            '등록된 파일 없음')))),
                                    const SizedBox(height: 12),
                                    if (local != null)
                                      Text('선택한 파일: ${local.fileName}',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 10),
                                    Wrap(spacing: 8, runSpacing: 8, children: [
                                      FilledButton.icon(
                                          onPressed: () => _choose(slot),
                                          icon: const Icon(Icons.photo_library),
                                          label: Text(
                                              current == null && local == null
                                                  ? '파일 선택'
                                                  : '파일 교체')),
                                      if (current != null || local != null)
                                        OutlinedButton.icon(
                                            onPressed: () =>
                                                _choose(slot, existing: true),
                                            icon: const Icon(Icons.crop),
                                            label: const Text('다시 편집')),
                                      if (current != null || local != null)
                                        OutlinedButton.icon(
                                            onPressed: () => _delete(slot),
                                            icon: const Icon(
                                                Icons.delete_outline),
                                            label: const Text('삭제')),
                                    ]),
                                  ])));
                    }),
                    const SizedBox(height: 80),
                  ]),
      ));
}
