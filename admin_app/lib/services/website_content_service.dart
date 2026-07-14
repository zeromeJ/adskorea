import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../models/website_content.dart';
import 'api_client.dart';

class WebsiteContentService {
  WebsiteContentService(this._api);
  final ApiClient _api;

  Future<List<WebsiteSectionSummary>> sections() async {
    final json = await _api.get('/api/admin/website');
    return (json['sections'] as List)
        .map((e) => WebsiteSectionSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<WebsiteAsset>> assets(String sectionKey) async {
    final json = await _api.get('/api/admin/website/$sectionKey');
    final section = json['section'] as Map<String, dynamic>;
    return (section['assets'] as List? ?? [])
        .map((e) => WebsiteAsset(e as Map<String, dynamic>))
        .toList();
  }

  Future<WebsiteAsset> uploadImage(
      String sectionKey, ImageSlot slot, PendingImageEdit edit) async {
    final json = await _api.multipart('/api/admin/website/upload', fields: {
      'sectionKey': sectionKey,
      'itemKey': slot.key,
      'label': slot.label,
      'aspectRatio': slot.ratio,
      'outputWidth': '${slot.width}',
      'outputHeight': '${slot.height}',
      'cropX': '${edit.crop[0]}',
      'cropY': '${edit.crop[1]}',
      'cropWidth': '${edit.crop[2]}',
      'cropHeight': '${edit.crop[3]}',
      'zoom': '${edit.zoom}',
      'rotation': '${edit.rotation}',
    }, files: [
      http.MultipartFile.fromBytes('original', edit.original,
          filename: edit.fileName),
      http.MultipartFile.fromBytes('edited', edit.edited,
          filename: 'edited-${edit.fileName}'),
    ]);
    return WebsiteAsset(json['asset'] as Map<String, dynamic>);
  }

  Future<List<WebsiteAsset>> uploadHeroImages(
      PendingImageEdit edit, ImageSlot desktopSlot) async {
    final desktop = await uploadImage('home', desktopSlot, edit);
    const mobileSlot = ImageSlot(
      key: 'heroMobile',
      label: 'Hero 모바일 이미지',
      ratio: '4:5',
      width: 1080,
      height: 1350,
      description: 'Hero 대표 이미지에서 자동 생성된 모바일 이미지',
    );
    final mobileEdit = PendingImageEdit(
      original: edit.original,
      edited: edit.original,
      fileName: edit.fileName,
      width: edit.width,
      height: edit.height,
      crop: const [0, 0, 1, 1],
      zoom: 1,
      rotation: 0,
    );
    final mobile = await uploadImage('home', mobileSlot, mobileEdit);
    return [desktop, mobile];
  }

  Future<WebsiteAsset> uploadFile(
    String sectionKey,
    ImageSlot slot,
    PendingFileUpload file,
  ) async {
    final json =
        await _api.multipart('/api/admin/website/file-upload', fields: {
      'sectionKey': sectionKey,
      'itemKey': slot.key,
      'label': slot.label,
      'assetType': slot.type == WebsiteSlotType.pdf ? 'PDF' : 'VIDEO',
    }, files: [
      http.MultipartFile.fromBytes(
        'file',
        file.bytes,
        filename: file.fileName,
        contentType: MediaType.parse(file.mimeType),
      ),
    ]);
    return WebsiteAsset(json['asset'] as Map<String, dynamic>);
  }

  Future<void> saveSection(String sectionKey, List<WebsiteAsset> assets) async {
    await _api.put('/api/admin/website/$sectionKey',
        {'assets': assets.map((e) => e.data).toList()});
  }
}
