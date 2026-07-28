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
    final items = (json['items'] as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Customer.fromJson)
        .toList();
    return CustomerListResult(
      items: items,
      total: json['total'] as int? ?? items.length,
    );
  }

  Future<Customer> fetchCustomer(String id) async {
    final json = await client.get('/api/admin/customers/$id');
    return Customer.fromJson(json['item'] as Map<String, dynamic>);
  }

  Future<void> updateCustomerMemo(String id, String memo) async {
    await client.patch('/api/admin/customers/$id', {'memo': memo});
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

  Future<void> updateCompanyMemo(String id, String memo) async {
    await client.patch('/api/admin/companies/$id', {'memo': memo});
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
