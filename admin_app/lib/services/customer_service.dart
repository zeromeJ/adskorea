import '../models/customer.dart';
import 'api_client.dart';

class CustomerListResult {
  const CustomerListResult({required this.items, required this.total});

  final List<Customer> items;
  final int total;
}

class CustomerService {
  CustomerService(this.client);

  final ApiClient client;

  Future<CustomerListResult> fetchCustomers({
    String filter = 'ALL',
    String search = '',
  }) async {
    final json = await client.get('/api/admin/customers', {
      'filter': filter,
      'search': search,
      'limit': '100',
    });
    final rawItems = (json['items'] as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    await _fillMissingListMetrics(rawItems);
    final items = rawItems.map(Customer.fromJson).toList();
    return CustomerListResult(
      items: items,
      total: json['total'] as int? ?? items.length,
    );
  }

  Future<void> _fillMissingListMetrics(
    List<Map<String, dynamic>> rawItems,
  ) async {
    final missing = rawItems
        .asMap()
        .entries
        .where(
          (entry) =>
              !entry.value.containsKey('pendingInquiryCount') ||
              !entry.value.containsKey('recentInquiryAt'),
        )
        .toList();
    const batchSize = 6;
    for (var start = 0; start < missing.length; start += batchSize) {
      final end = start + batchSize < missing.length
          ? start + batchSize
          : missing.length;
      await Future.wait(
        missing.sublist(start, end).map((entry) async {
          final id = entry.value['id'] as String? ?? '';
          if (id.isEmpty) return;
          try {
            final detail = await fetchCustomer(id);
            final pendingCount = detail.inquiries
                .where(
                  (inquiry) => inquiry.status == CustomerInquiryStatus.pending,
                )
                .length;
            final sortedInquiries = [
              ...detail.inquiries
            ]..sort((left, right) => right.createdAt.compareTo(left.createdAt));
            entry.value['pendingInquiryCount'] = pendingCount;
            entry.value['inquiryCount'] = detail.inquiryCount;
            entry.value['recentInquiryAt'] = sortedInquiries.isEmpty
                ? null
                : sortedInquiries.first.createdAt.toUtc().toIso8601String();
          } catch (_) {
            // 구버전 목록 API를 보완하는 요청이므로 개별 실패는 목록을 막지 않는다.
          }
        }),
      );
    }
  }

  Future<Customer> fetchCustomer(String id) async {
    final json = await client.get('/api/admin/customers/$id');
    return Customer.fromJson(json['item'] as Map<String, dynamic>);
  }

  Future<void> updateCustomerMemo(
    String id,
    String memo, {
    String visibility = 'SHARED',
  }) async {
    await client.patch('/api/admin/customers/$id', {
      'memo': memo,
      'memoVisibility': visibility,
    });
  }

  Future<void> setFavorite(String id, bool favorite) async {
    await client.patch('/api/admin/customers/$id/favorite', {
      'favorite': favorite,
    });
  }

  Future<CompanyDetail> fetchCompany(String id) async {
    final json = await client.get('/api/admin/companies/$id');
    return CompanyDetail.fromJson(json['item'] as Map<String, dynamic>);
  }

  Future<void> updateCompanyMemo(
    String id,
    String memo, {
    String visibility = 'SHARED',
  }) async {
    await client.patch('/api/admin/companies/$id', {
      'memo': memo,
      'memoVisibility': visibility,
    });
  }

  Future<List<CustomerCompany>> searchCompanies(String search) async {
    final json = await client.get('/api/admin/companies', {'search': search});
    return (json['items'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(CustomerCompany.fromJson)
        .toList();
  }

  Future<CustomerCompany> createCompany(String name) async {
    final json = await client.post('/api/admin/companies', {'name': name});
    return CustomerCompany.fromJson(
      json['item'] as Map<String, dynamic>? ?? const {},
    );
  }

  Future<void> changeCustomerCompany(
    String customerId, {
    required String action,
    String? companyId,
    String? companyName,
  }) async {
    await client.patch('/api/admin/customers/$customerId/company', {
      'action': action,
      if (companyId != null) 'companyId': companyId,
      if (companyName != null) 'companyName': companyName,
    });
  }

  Future<void> requestReview(
    String customerId, {
    required String type,
    String? note,
  }) async {
    await client.post('/api/admin/customers/$customerId/review-request', {
      'type': type,
      'note': note,
    });
  }

  Future<void> linkInquiryToCustomer(
    String inquiryId,
    String candidateCustomerId,
  ) async {
    await client.post('/api/admin/inquiries/$inquiryId/customer-link', {
      'action': 'LINK',
      'candidateCustomerId': candidateCustomerId,
    });
  }

  Future<void> keepInquiryAsNewCustomer(String inquiryId) async {
    await client.post('/api/admin/inquiries/$inquiryId/customer-link', {
      'action': 'KEEP_SEPARATE',
    });
  }

  Future<void> unlinkInquiryCustomer(String inquiryId) async {
    await client.delete('/api/admin/inquiries/$inquiryId/customer-link');
  }

  Future<void> mergeCustomer(
    String sourceCustomerId,
    String targetCustomerId,
  ) async {
    await client.post('/api/admin/customers/$sourceCustomerId/merge', {
      'targetCustomerId': targetCustomerId,
    });
  }

  Future<void> undoCustomerMerge(
    String targetCustomerId,
    String mergeLogId,
  ) async {
    await client.post(
      '/api/admin/customers/$targetCustomerId/merge-history/$mergeLogId/undo',
      const {},
    );
  }
}
