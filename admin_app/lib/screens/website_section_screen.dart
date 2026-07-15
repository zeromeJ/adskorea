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
  final Map<String, PendingFileUpload> pendingFiles = {};
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
      assets = await widget.service
          .assets(websiteStorageSectionKey(widget.summary.key));
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
    final maxBytes = isPdf ? 30 * 1024 * 1024 : 150 * 1024 * 1024;
    if (bytes.length > maxBytes) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(isPdf
                ? 'PDF는 30MB 이하만 등록할 수 있습니다.'
                : '영상은 150MB 이하만 등록할 수 있습니다.')));
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
      if (pending.containsKey('heroDesktop') ||
          deleted.contains('heroDesktop')) {
        next.removeWhere((asset) => asset.itemKey == 'heroMobile');
      }
      final storageSectionKey = websiteStorageSectionKey(widget.summary.key);
      for (final slot in slots) {
        final edit = pending[slot.key];
        if (edit != null) {
          if (widget.summary.key == 'home' && slot.key == 'heroDesktop') {
            next.addAll(await widget.service.uploadHeroImages(edit, slot));
          } else {
            next.add(await widget.service
                .uploadImage(storageSectionKey, slot, edit));
          }
        }
        final file = pendingFiles[slot.key];
        if (file != null) {
          next.add(
              await widget.service.uploadFile(storageSectionKey, slot, file));
        }
      }
      await widget.service.saveSection(storageSectionKey, next);
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
            if (isPdf)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text('표지 이미지는 서버에서 자동으로 생성됩니다.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF667085))),
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
                          onPressed: dirty && !saving ? _load : null,
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
                                            Text('선택한 파일: ${local.fileName}',
                                                maxLines: 2,
                                                overflow:
                                                    TextOverflow.ellipsis),
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
