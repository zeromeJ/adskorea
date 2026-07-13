import '../models/inquiry.dart';
import 'api_client.dart';

class InquiryListResult {
  const InquiryListResult({
    required this.items,
    required this.total,
  });

  final List<Inquiry> items;
  final int total;
}

class InquiryService {
  InquiryService(this.client);

  final ApiClient client;

  Future<InquiryListResult> fetchInquiries({
    String status = 'PENDING',
    String search = '',
    int page = 1,
    int limit = 30,
  }) async {
    final json = await client.get('/api/admin/inquiries', {
      'status': status,
      'page': '$page',
      'limit': '$limit',
      'search': search,
    });

    final items = (json['items'] as List<dynamic>)
        .map((item) => Inquiry.fromJson(item as Map<String, dynamic>))
        .toList();

    return InquiryListResult(
      items: items,
      total: json['total'] as int? ?? items.length,
    );
  }

  Future<Inquiry> fetchInquiry(String id) async {
    final json = await client.get('/api/admin/inquiries/$id');
    return Inquiry.fromJson(json['item'] as Map<String, dynamic>);
  }

  Future<Inquiry> updateInquiry(
    String id, {
    InquiryStatus? status,
    String? adminMemo,
  }) async {
    final json = await client.patch('/api/admin/inquiries/$id', {
      if (status != null) 'status': inquiryStatusToApi(status),
      if (adminMemo != null) 'adminMemo': adminMemo,
    });

    return Inquiry.fromJson(json['item'] as Map<String, dynamic>);
  }
}
