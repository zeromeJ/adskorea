import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:crop_your_image/crop_your_image.dart';
import 'package:flutter/material.dart';
import 'package:image/image.dart' as image_lib;
import '../models/website_content.dart';

class ImageEditorDialog extends StatefulWidget {
  const ImageEditorDialog(
      {required this.slot,
      required this.bytes,
      required this.fileName,
      this.initialCrop,
      this.initialZoom = 1,
      this.initialRotation = 0,
      super.key});
  final ImageSlot slot;
  final Uint8List bytes;
  final String fileName;
  final List<double>? initialCrop;
  final double initialZoom;
  final int initialRotation;

  static Future<PendingImageEdit?> open(BuildContext context,
      {required ImageSlot slot,
      required Uint8List bytes,
      required String fileName,
      List<double>? initialCrop,
      double initialZoom = 1,
      int initialRotation = 0}) {
    return Navigator.of(context).push<PendingImageEdit>(MaterialPageRoute(
        fullscreenDialog: true,
        builder: (_) => ImageEditorDialog(
            slot: slot,
            bytes: bytes,
            fileName: fileName,
            initialCrop: initialCrop,
            initialZoom: initialZoom,
            initialRotation: initialRotation)));
  }

  @override
  State<ImageEditorDialog> createState() => _ImageEditorDialogState();
}

class _ImageEditorDialogState extends State<ImageEditorDialog> {
  final _controller = CropController();
  late Uint8List _working;
  Rect? _imageArea;
  Rect? _viewportCropRect;
  Rect? _viewportImageRect;
  int _width = 0, _height = 0, _rotation = 0;
  double _zoom = 1;
  bool _ready = false, _cropping = false, _initialApplied = false;

  @override
  void initState() {
    super.initState();
    _working = widget.bytes;
    _rotation = widget.initialRotation % 360;
    _zoom = widget.initialZoom.clamp(1, 4);
    if (_rotation != 0) {
      final decoded = image_lib.decodeImage(_working);
      if (decoded != null) {
        _working = Uint8List.fromList(image_lib
            .encodePng(image_lib.copyRotate(decoded, angle: _rotation)));
      }
    }
    _readSize();
  }

  Future<void> _readSize() async {
    final codec = await ui.instantiateImageCodec(widget.bytes);
    final frame = await codec.getNextFrame();
    if (mounted) {
      setState(() {
        _width = frame.image.width;
        _height = frame.image.height;
      });
    }
    frame.image.dispose();
    codec.dispose();
  }

  void _reset() {
    setState(() {
      _working = widget.bytes;
      _rotation = 0;
      _zoom = 1;
      _imageArea = null;
      _viewportCropRect = null;
      _viewportImageRect = null;
      _ready = false;
    });
    _controller.image = widget.bytes;
  }

  void _autoFit() {
    _controller.image = _working;
    setState(() {
      _zoom = 1;
      _imageArea = null;
      _viewportCropRect = null;
      _viewportImageRect = null;
    });
  }

  void _rotate() {
    final decoded = image_lib.decodeImage(_working);
    if (decoded == null) return;
    final rotated = image_lib.copyRotate(decoded, angle: 90);
    _working = Uint8List.fromList(image_lib.encodePng(rotated));
    _rotation = (_rotation + 90) % 360;
    _zoom = 1;
    _imageArea = null;
    _viewportCropRect = null;
    _viewportImageRect = null;
    _controller.image = _working;
    setState(() {});
  }

  Rect? _cropAreaFromViewport() {
    final cropRect = _viewportCropRect;
    final imageRect = _viewportImageRect;
    if (cropRect == null || imageRect == null || imageRect.isEmpty) return null;
    final sourceWidth = (_rotation % 180 == 0 ? _width : _height).toDouble();
    final sourceHeight = (_rotation % 180 == 0 ? _height : _width).toDouble();
    if (sourceWidth <= 0 || sourceHeight <= 0) return null;

    final left =
        ((cropRect.left - imageRect.left) / imageRect.width * sourceWidth)
            .clamp(0.0, sourceWidth);
    final top =
        ((cropRect.top - imageRect.top) / imageRect.height * sourceHeight)
            .clamp(0.0, sourceHeight);
    final right =
        ((cropRect.right - imageRect.left) / imageRect.width * sourceWidth)
            .clamp(left, sourceWidth);
    final bottom =
        ((cropRect.bottom - imageRect.top) / imageRect.height * sourceHeight)
            .clamp(top, sourceHeight);
    return Rect.fromLTRB(left, top, right, bottom);
  }

  void _updateViewportImage(Rect imageRect) {
    _viewportImageRect = imageRect;
    _imageArea = _cropAreaFromViewport() ?? _imageArea;
  }

  void _setZoom(double value) {
    if (!_ready) return;
    setState(() => _zoom = value);
    final sourceW =
        _rotation % 180 == 0 ? _width.toDouble() : _height.toDouble();
    final sourceH =
        _rotation % 180 == 0 ? _height.toDouble() : _width.toDouble();
    var cropW = sourceW / value;
    var cropH = cropW / widget.slot.aspect;
    if (cropH > sourceH / value) {
      cropH = sourceH / value;
      cropW = cropH * widget.slot.aspect;
    }
    final current = _imageArea;
    final center = current?.center ?? Offset(sourceW / 2, sourceH / 2);
    final left = (center.dx - cropW / 2).clamp(0.0, sourceW - cropW);
    final top = (center.dy - cropH / 2).clamp(0.0, sourceH - cropH);
    _controller.area = Rect.fromLTWH(left, top, cropW, cropH);
  }

  void _apply() {
    if (_ready && !_cropping) {
      setState(() => _cropping = true);
      final exactArea = _cropAreaFromViewport() ?? _imageArea;
      if (exactArea != null && !exactArea.isEmpty) {
        _imageArea = exactArea;
        _controller.area = exactArea;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _controller.crop();
        });
      } else {
        _controller.crop();
      }
    }
  }

  void _onCropped(CropResult result) {
    if (!mounted) return;
    switch (result) {
      case CropSuccess(:final croppedImage):
        final sourceW = (_rotation % 180 == 0 ? _width : _height).toDouble();
        final sourceH = (_rotation % 180 == 0 ? _height : _width).toDouble();
        final area = _imageArea ?? Rect.fromLTWH(0, 0, sourceW, sourceH);
        Navigator.pop(
            context,
            PendingImageEdit(
              original: widget.bytes,
              edited: croppedImage,
              fileName: widget.fileName,
              width: _width,
              height: _height,
              rotation: _rotation,
              zoom: _zoom,
              crop: [
                area.left / sourceW,
                area.top / sourceH,
                area.width / sourceW,
                area.height / sourceH
              ],
            ));
      case CropFailure(:final cause):
        setState(() => _cropping = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('이미지를 자르지 못했습니다: $cause')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final low = _width > 0 &&
        (_width < widget.slot.width || _height < widget.slot.height);
    return Scaffold(
      appBar: AppBar(
          title: Text(widget.slot.label,
              maxLines: 1, overflow: TextOverflow.ellipsis),
          leading: IconButton(
              icon: const Icon(Icons.close),
              tooltip: '취소',
              onPressed: () => Navigator.pop(context))),
      bottomNavigationBar: SafeArea(
          top: false,
          child: Container(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Color(0xFFE0E2DD)))),
              child: Row(children: [
                Expanded(
                    child: OutlinedButton(
                        onPressed:
                            _cropping ? null : () => Navigator.pop(context),
                        child: const Text('취소', maxLines: 1))),
                const SizedBox(width: 8),
                Expanded(
                    child: FilledButton.icon(
                        onPressed: _ready && !_cropping ? _apply : null,
                        icon: _cropping
                            ? const SizedBox.square(
                                dimension: 18,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.check),
                        label: const Text('적용', maxLines: 1))),
              ]))),
      body: SafeArea(child: LayoutBuilder(builder: (context, viewport) {
        final editorHeight = (viewport.maxWidth > 800
                ? viewport.maxHeight * .6
                : viewport.maxHeight * .5)
            .clamp(viewport.maxWidth > 800 ? 360.0 : 280.0,
                viewport.maxWidth > 800 ? 620.0 : 430.0)
            .toDouble();

        return SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: Column(children: [
              Container(
                  width: double.infinity,
                  color: const Color(0xFFF4F5F1),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  child: Text(
                      '권장 ${widget.slot.ratio}  ·  ${_width > 0 ? '$_width × $_height px' : '크기 확인 중'}',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w700))),
              if (low)
                Container(
                    width: double.infinity,
                    color: const Color(0xFFFFE8E8),
                    padding: const EdgeInsets.all(12),
                    child: const Text('이미지 해상도가 낮아 화면에서 흐리게 보일 수 있습니다.',
                        style: TextStyle(
                            color: Color(0xFFB42318),
                            fontWeight: FontWeight.w700))),
              Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                  child: SizedBox(
                      height: editorHeight,
                      child: LayoutBuilder(builder: (context, constraints) {
                        final editor = ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Crop(
                              image: _working,
                              controller: _controller,
                              onCropped: _onCropped,
                              aspectRatio: widget.slot.aspect,
                              interactive: true,
                              fixCropRect: true,
                              baseColor: const Color(0xFF15251D),
                              maskColor: Colors.black.withValues(alpha: .55),
                              radius: 8,
                              onMoved: (cropRect, imageArea) {
                                _viewportCropRect = cropRect;
                                _imageArea = imageArea;
                              },
                              onImageMoved: _updateViewportImage,
                              onStatusChanged: (status) {
                                if (mounted) {
                                  setState(() =>
                                      _ready = status == CropStatus.ready);
                                  if (status == CropStatus.ready &&
                                      !_initialApplied &&
                                      widget.initialCrop?.length == 4) {
                                    _initialApplied = true;
                                    final sourceW = (_rotation % 180 == 0
                                            ? _width
                                            : _height)
                                        .toDouble();
                                    final sourceH = (_rotation % 180 == 0
                                            ? _height
                                            : _width)
                                        .toDouble();
                                    final crop = widget.initialCrop!;
                                    WidgetsBinding.instance
                                        .addPostFrameCallback((_) {
                                      _controller.area = Rect.fromLTWH(
                                          crop[0] * sourceW,
                                          crop[1] * sourceH,
                                          crop[2] * sourceW,
                                          crop[3] * sourceH);
                                    });
                                  }
                                }
                              },
                              cornerDotBuilder: (size, edge) =>
                                  const DotControl(color: Colors.white),
                            ));
                        final preview = Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('홈페이지 표시 비율 미리보기',
                                  style:
                                      TextStyle(fontWeight: FontWeight.w800)),
                              const SizedBox(height: 8),
                              AspectRatio(
                                  aspectRatio: widget.slot.aspect,
                                  child: ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.memory(_working,
                                          fit: BoxFit.cover))),
                            ]);
                        if (constraints.maxWidth > 800) {
                          return Row(children: [
                            Expanded(flex: 3, child: editor),
                            const SizedBox(width: 20),
                            Expanded(flex: 2, child: preview)
                          ]);
                        }
                        return editor;
                      }))),
              Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                  child: Column(children: [
                    Row(children: [
                      const Text('크기',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      Expanded(
                          child: Slider(
                              value: _zoom,
                              min: 1,
                              max: 4,
                              divisions: 30,
                              label: '${_zoom.toStringAsFixed(1)}배',
                              onChanged: _setZoom))
                    ]),
                    LayoutBuilder(builder: (context, constraints) {
                      final itemWidth = (constraints.maxWidth - 8) / 2;
                      return Wrap(spacing: 8, runSpacing: 8, children: [
                        SizedBox(
                            width: itemWidth,
                            child: OutlinedButton.icon(
                                onPressed: _rotate,
                                icon: const Icon(Icons.rotate_right),
                                label: const Text('회전', maxLines: 1))),
                        SizedBox(
                            width: itemWidth,
                            child: OutlinedButton.icon(
                                onPressed: _autoFit,
                                icon: const Icon(Icons.fit_screen),
                                label: const Text('자동 맞춤', maxLines: 1))),
                        SizedBox(
                            width: itemWidth,
                            child: OutlinedButton.icon(
                                onPressed: _reset,
                                icon: const Icon(Icons.restore),
                                label: const Text('원본 복원', maxLines: 1))),
                      ]);
                    }),
                  ])),
              const SizedBox(height: 20),
            ]));
      })),
    );
  }
}
