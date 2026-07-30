import '../models/inquiry.dart';
import 'api_client.dart';

class InquiryListResult {
  const InquiryListResult({
    required this.counts,
    required this.items,
    required this.total,
    required this.summary,
  });

  final InquiryListCounts counts;
  final List<Inquiry> items;
  final int total;
  final InquiryWorkSummary summary;
}

class InquiryWorkSummary {
  const InquiryWorkSummary({
    this.unassigned = 0,
    this.staleOneDay = 0,
    this.staleThreeDay = 0,
    this.minePending = 0,
  });

  final int unassigned;
  final int staleOneDay;
  final int staleThreeDay;
  final int minePending;

  static int _count(Map<String, dynamic> values, String key) =>
      (values[key] as num?)?.toInt() ?? 0;

  factory InquiryWorkSummary.fromJson(dynamic json) {
    final values = json is Map
        ? Map<String, dynamic>.from(json)
        : const <String, dynamic>{};
    return InquiryWorkSummary(
      unassigned: _count(values, 'unassigned'),
      staleOneDay: _count(values, 'stale1d'),
      staleThreeDay: _count(values, 'stale3d'),
      minePending: _count(values, 'minePending'),
    );
  }
}

class InquiryListCounts {
  const InquiryListCounts({
    this.all = 0,
    this.unassigned = 0,
    this.pending = 0,
    this.completed = 0,
  });

  final int all;
  final int unassigned;
  final int pending;
  final int completed;

  static int _readCount(Map<String, dynamic> values, String key) {
    final value = values[key];
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  factory InquiryListCounts.fromJson(dynamic json) {
    final values = json is Map
        ? Map<String, dynamic>.from(json)
        : const <String, dynamic>{};
    return InquiryListCounts(
      all: _readCount(values, 'all'),
      unassigned: _readCount(values, 'unassigned'),
      pending: _readCount(values, 'pending'),
      completed: _readCount(values, 'completed'),
    );
  }
}

class InquiryService {
  InquiryService(this.client);

  final ApiClient client;

  Future<InquiryListResult> fetchInquiries({
    String scope = 'MINE',
    String status = 'PENDING',
    String search = '',
    int page = 1,
    int limit = 100,
  }) async {
    final json = await client.get('/api/admin/inquiries', {
      'scope': scope,
      'status': status,
      'page': '$page',
      'limit': '$limit',
      'search': search,
    });

    final items = (json['items'] as List<dynamic>)
        .map((item) => Inquiry.fromJson(item as Map<String, dynamic>))
        .toList();

    return InquiryListResult(
      counts: InquiryListCounts.fromJson(json['counts']),
      items: items,
      total: json['total'] as int? ?? items.length,
      summary: InquiryWorkSummary.fromJson(json['summary']),
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

  Future<Inquiry> assignInquiry(String id, String? adminId) async {
    final json = await client.patch('/api/admin/inquiries/$id', {
      'assignedAdminId': adminId,
    });
    return Inquiry.fromJson(json['item'] as Map<String, dynamic>);
  }

  Future<int> bulkAssignInquiries(
    List<String> inquiryIds,
    String? adminId,
  ) async {
    final json = await client.post('/api/admin/inquiries/bulk-assign', {
      'inquiryIds': inquiryIds,
      'assignedAdminId': adminId,
    });
    return (json['changedCount'] as num?)?.toInt() ?? 0;
  }

  Future<void> addConsultationRecord(
    String id, {
    required InquiryConsultationResult result,
    String? memo,
  }) async {
    await client.post('/api/admin/inquiries/$id/consultations', {
      'result': inquiryConsultationResultToApi(result),
      'memo': memo,
    });
  }
}
