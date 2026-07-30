import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdfrx/pdfrx.dart';
import '../models/inquiry.dart';
import '../widgets/adaptive_action_buttons.dart';

class AttachmentDetailScreen extends StatefulWidget {
  const AttachmentDetailScreen({required this.attachment, super.key});

  final InquiryAttachment attachment;

  @override
  State<AttachmentDetailScreen> createState() => _AttachmentDetailScreenState();
}

class _AttachmentDetailScreenState extends State<AttachmentDetailScreen> {
  http.Client? _downloadClient;
  double? _progress;
  String? _downloadedPath;
  String? _downloadError;
  bool _showPreview = false;
  bool _downloadCancelled = false;

  bool get _isDownloading => _progress != null && _downloadedPath == null;
  bool get _isImage => widget.attachment.contentType.startsWith('image/');
  bool get _isPdf =>
      widget.attachment.contentType == 'application/pdf' ||
      widget.attachment.fileName.toLowerCase().endsWith('.pdf');
  bool get _canPreview => _isImage || _isPdf;

  @override
  void dispose() {
    _downloadClient?.close();
    super.dispose();
  }

  String _formatBytes(int bytes) {
    if (bytes >= 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    if (bytes >= 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '$bytes B';
  }

  String get _fileType {
    if (_isPdf) return 'PDF';
    if (_isImage) return '이미지';
    final extension = widget.attachment.fileName.split('.').lastOrNull;
    return extension?.toUpperCase() ?? widget.attachment.contentType;
  }

  Future<void> _download() async {
    final downloadUrl = widget.attachment.downloadUrl;
    if (downloadUrl == null || downloadUrl.isEmpty || _isDownloading) return;
    setState(() {
      _progress = 0;
      _downloadedPath = null;
      _downloadError = null;
      _downloadCancelled = false;
    });
    final client = http.Client();
    _downloadClient = client;
    IOSink? sink;
    File? targetFile;
    try {
      final request = http.Request('GET', Uri.parse(downloadUrl));
      final response = await client.send(request);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('다운로드 응답 ${response.statusCode}');
      }
      final directory = await getDownloadsDirectory() ??
          await getApplicationDocumentsDirectory();
      final safeName = widget.attachment.fileName.replaceAll(
        RegExp(r'[\\/:*?"<>|]'),
        '_',
      );
      targetFile = File('${directory.path}/$safeName');
      sink = targetFile.openWrite();
      var received = 0;
      final total = response.contentLength ?? widget.attachment.size;
      await for (final chunk in response.stream) {
        sink.add(chunk);
        received += chunk.length;
        if (mounted && total > 0) {
          setState(() => _progress = received / total);
        }
      }
      await sink.flush();
      await sink.close();
      sink = null;
      if (!mounted) return;
      setState(() {
        _progress = 1;
        _downloadedPath = targetFile?.path;
      });
    } catch (_) {
      await sink?.close();
      if (await targetFile?.exists() == true) {
        await targetFile?.delete();
      }
      if (!mounted) return;
      setState(() {
        _progress = null;
        _downloadError =
            _downloadCancelled ? '다운로드를 취소했습니다.' : '파일을 다운로드하지 못했습니다.';
      });
    } finally {
      client.close();
      if (identical(_downloadClient, client)) _downloadClient = null;
    }
  }

  void _cancelDownload() {
    _downloadCancelled = true;
    _downloadClient?.close();
    _downloadClient = null;
    setState(() {
      _progress = null;
      _downloadError = '다운로드를 취소했습니다.';
    });
  }

  Future<void> _openDownloadedFile() async {
    final path = _downloadedPath;
    if (path == null) return;
    await OpenFilex.open(path);
  }

  @override
  Widget build(BuildContext context) {
    final attachment = widget.attachment;
    final downloadUrl = attachment.downloadUrl;
    return Scaffold(
      appBar: AppBar(title: const Text('첨부파일')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    attachment.fileName,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _info('파일 형식', _fileType),
                  _info('파일 크기', _formatBytes(attachment.size)),
                  _info(
                    '첨부일',
                    attachment.createdAt == null
                        ? '-'
                        : DateFormat('yyyy.MM.dd HH:mm')
                            .format(attachment.createdAt!.toLocal()),
                  ),
                  _info('첨부 주체', '고객'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          AdaptiveActionButtons(
            children: [
              OutlinedButton(
                onPressed: _canPreview && downloadUrl?.isNotEmpty == true
                    ? () => setState(() => _showPreview = !_showPreview)
                    : null,
                child: Text(_showPreview ? '미리보기 닫기' : '미리보기'),
              ),
              FilledButton(
                onPressed: _isDownloading || downloadUrl?.isNotEmpty != true
                    ? null
                    : _download,
                child: const Text('다운로드'),
              ),
            ],
          ),
          if (_isDownloading) ...[
            const SizedBox(height: 16),
            Text(
              '다운로드 중 ${((_progress ?? 0) * 100).round()}%',
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(value: _progress),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _cancelDownload,
              child: const Text('다운로드 취소'),
            ),
          ],
          if (_downloadError != null) ...[
            const SizedBox(height: 14),
            Text(
              _downloadError!,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _download,
              child: const Text('다시 시도'),
            ),
          ],
          if (_downloadedPath != null) ...[
            const SizedBox(height: 14),
            const Text(
              '다운로드 폴더에 저장되었습니다.',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: _openDownloadedFile,
              child: const Text('파일 열기'),
            ),
          ],
          if (_showPreview && downloadUrl != null) ...[
            const SizedBox(height: 18),
            Text(
              '미리보기',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: MediaQuery.sizeOf(context).height * .58,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: ColoredBox(
                  color: Colors.white,
                  child: _isPdf
                      ? PdfViewer.uri(Uri.parse(downloadUrl))
                      : InteractiveViewer(
                          child: Image.network(
                            downloadUrl,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => const Center(
                              child: Text('미리보기를 불러오지 못했습니다.'),
                            ),
                          ),
                        ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _info(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
