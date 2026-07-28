import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../models/admin_user.dart';
import '../models/customer.dart';
import '../services/admin_management_service.dart';
import '../services/customer_service.dart';
import '../services/inquiry_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_view.dart';
import 'customer_detail_screen.dart';

class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({
    required this.currentAdmin,
    required this.customerService,
    required this.inquiryService,
    required this.adminManagementService,
    required this.refreshVersion,
    required this.onOpenInquiries,
    super.key,
  });

  final AdminUser currentAdmin;
  final CustomerService customerService;
  final InquiryService inquiryService;
  final AdminManagementService adminManagementService;
  final int refreshVersion;
  final VoidCallback onOpenInquiries;

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  final _searchController = TextEditingController();
  String _filter = 'ALL';
  String _search = '';
  bool _isLoading = true;
  String? _error;
  List<Customer> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant CustomerListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.refreshVersion != oldWidget.refreshVersion) {
      _load();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final result = await widget.customerService.fetchCustomers(
        filter: _filter,
        search: _search,
      );
      if (mounted) setState(() => _items = result.items);
    } catch (_) {
      if (mounted) setState(() => _error = '고객 목록을 불러오지 못했습니다.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _searchCustomers() async {
    FocusManager.instance.primaryFocus?.unfocus();
    _search = _searchController.text.trim();
    await _load();
  }

  Future<void> _changeFilter(String value) async {
    if (_filter == value) return;
    setState(() => _filter = value);
    await _load();
  }

  Future<void> _openCustomer(Customer customer) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CustomerDetailScreen(
          customerId: customer.id,
          currentAdmin: widget.currentAdmin,
          customerService: widget.customerService,
          inquiryService: widget.inquiryService,
          adminManagementService: widget.adminManagementService,
        ),
      ),
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final filters = <ButtonSegment<String>>[
      const ButtonSegment(value: 'ALL', label: Text('전체')),
      const ButtonSegment(
        value: 'FAVORITES',
        label: Text('즐겨찾기'),
      ),
      if (widget.currentAdmin.isSuperAdmin)
        const ButtonSegment(
          value: 'DUPLICATES',
          label: Text('중복 검토'),
        ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('고객 관리')),
      bottomNavigationBar: NavigationBar(
        height: 72,
        selectedIndex: 1,
        onDestinationSelected: (index) {
          if (index == 0) widget.onOpenInquiries();
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment),
            label: '문의 관리',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: '고객 관리',
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      textInputAction: TextInputAction.search,
                      onSubmitted: (_) => _searchCustomers(),
                      decoration: const InputDecoration(
                        labelText: '고객 검색',
                        hintText: '접수번호, 전화번호, 이메일, 회사명, 고객명',
                        prefixIcon: Icon(Icons.search),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _isLoading ? null : _searchCustomers,
                    child: const Text('검색'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
              child: SizedBox(
                width: double.infinity,
                child: SegmentedButton<String>(
                  segments: filters,
                  selected: {_filter},
                  showSelectedIcon: false,
                  onSelectionChanged: (selected) =>
                      _changeFilter(selected.first),
                ),
              ),
            ),
            Expanded(
              child: _isLoading
                  ? const LoadingView()
                  : _error != null
                      ? ErrorView(message: _error!, onRetry: _load)
                      : _items.isEmpty
                          ? const EmptyState(message: '조건에 맞는 고객이 없습니다.')
                          : RefreshIndicator(
                              onRefresh: _load,
                              child: ListView.separated(
                                padding:
                                    const EdgeInsets.fromLTRB(16, 4, 16, 24),
                                itemCount: _items.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 10),
                                itemBuilder: (context, index) {
                                  final customer = _items[index];
                                  return Card(
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      side: const BorderSide(
                                        color: AppColors.line,
                                      ),
                                    ),
                                    child: InkWell(
                                      borderRadius: BorderRadius.circular(12),
                                      onTap: () => _openCustomer(customer),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    customer.nameLabel,
                                                    style: const TextStyle(
                                                      fontSize: 19,
                                                      fontWeight:
                                                          FontWeight.w800,
                                                    ),
                                                  ),
                                                ),
                                                if (customer.isFavorite)
                                                  const Chip(
                                                    avatar: Icon(
                                                      Icons.star,
                                                      size: 18,
                                                    ),
                                                    label: Text('즐겨찾기'),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              customer.companyNameLabel,
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                            const SizedBox(height: 10),
                                            if (customer.phone?.isNotEmpty ==
                                                true)
                                              Text(
                                                '전화번호  ${customer.phone}',
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                ),
                                              ),
                                            if (customer.email?.isNotEmpty ==
                                                true)
                                              Text(
                                                '이메일  ${customer.email}',
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                ),
                                              ),
                                            const SizedBox(height: 10),
                                            Wrap(
                                              spacing: 8,
                                              runSpacing: 8,
                                              children: [
                                                Chip(
                                                  label: Text(
                                                    '문의 ${customer.inquiryCount}건',
                                                  ),
                                                ),
                                                if (customer
                                                    .hasPendingDuplicate)
                                                  const Chip(
                                                    avatar: Icon(
                                                      Icons.info_outline,
                                                      size: 18,
                                                    ),
                                                    label: Text('확인 필요'),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            const Align(
                                              alignment: Alignment.centerRight,
                                              child: Text(
                                                '고객 상세 보기  ›',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w800,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
