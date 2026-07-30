import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
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
  bool _isRefreshing = false;
  String? _error;
  List<Customer> _items = [];
  final Set<String> _changingFavorites = {};

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
      _isLoading = _items.isEmpty;
      _isRefreshing = _items.isNotEmpty;
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
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
        });
      }
    }
  }

  Future<void> _searchCustomers() async {
    FocusManager.instance.primaryFocus?.unfocus();
    _search = _searchController.text.trim();
    await _load();
  }

  Future<void> _clearSearch() async {
    _searchController.clear();
    _search = '';
    await _load();
  }

  Future<void> _resetFilters() async {
    _searchController.clear();
    setState(() {
      _search = '';
      _filter = 'ALL';
    });
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

  Future<void> _toggleFavorite(Customer customer) async {
    if (!_changingFavorites.add(customer.id)) return;
    setState(() {});
    try {
      await widget.customerService.setFavorite(
        customer.id,
        !customer.isFavorite,
      );
      await _load();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('즐겨찾기를 변경하지 못했습니다.')),
        );
      }
    } finally {
      _changingFavorites.remove(customer.id);
      if (mounted) setState(() {});
    }
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
          label: Text('중복 확인'),
        ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('고객')),
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
            label: '문의',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: '고객',
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _searchController,
                    textInputAction: TextInputAction.search,
                    onChanged: (_) => setState(() {}),
                    onSubmitted: (_) => _searchCustomers(),
                    decoration: InputDecoration(
                      labelText: '고객 검색',
                      hintText: '회사명, 고객명, 전화번호, 접수번호 검색',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchController.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: '검색어 지우기',
                              onPressed: _clearSearch,
                              icon: const Icon(Icons.close),
                            ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: _isLoading ? null : _searchCustomers,
                    child: const Text('검색'),
                  ),
                ],
              ),
            ),
            if (_isRefreshing) ...[
              const LinearProgressIndicator(
                semanticsLabel: '새로 불러오는 중',
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: Text('새로 불러오는 중'),
              ),
            ],
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
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF3EE),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        _filter == 'ALL'
                            ? '전체 고객'
                            : _filter == 'FAVORITES'
                                ? '즐겨찾기'
                                : '중복 확인',
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ),
                    if (_filter != 'ALL' || _search.isNotEmpty)
                      TextButton(
                        onPressed: _resetFilters,
                        child: const Text('초기화'),
                      ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: _isLoading
                  ? const LoadingView()
                  : _error != null
                      ? ErrorView(message: _error!, onRetry: _load)
                      : _items.isEmpty
                          ? EmptyState(
                              message: _search.isNotEmpty
                                  ? '검색 결과가 없습니다.'
                                  : '조건에 맞는 고객이 없습니다.',
                              actionLabel:
                                  _search.isNotEmpty ? '검색 초기화' : '전체 보기',
                              onAction: _resetFilters,
                            )
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
                                                IconButton(
                                                  tooltip: customer.isFavorite
                                                      ? '즐겨찾기 해제'
                                                      : '즐겨찾기',
                                                  onPressed: _changingFavorites
                                                          .contains(
                                                    customer.id,
                                                  )
                                                      ? null
                                                      : () => _toggleFavorite(
                                                            customer,
                                                          ),
                                                  icon: Icon(
                                                    customer.isFavorite
                                                        ? Icons.star_rounded
                                                        : Icons
                                                            .star_border_rounded,
                                                    color: customer.isFavorite
                                                        ? const Color(
                                                            0xFFC49A33,
                                                          )
                                                        : AppColors.subText,
                                                    size: 30,
                                                  ),
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
                                            Wrap(
                                              spacing: 8,
                                              runSpacing: 8,
                                              children: [
                                                Chip(
                                                  label: Text(
                                                    '진행 중 ${customer.pendingInquiryCount}건',
                                                  ),
                                                ),
                                                if (customer.hasStaleInquiry)
                                                  const Chip(
                                                    avatar: Icon(
                                                      Icons.schedule,
                                                      size: 18,
                                                    ),
                                                    label: Text('미처리 있음'),
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
                                            const SizedBox(height: 6),
                                            Text(
                                              '최근 문의  ${customer.recentInquiryAt == null ? "-" : DateFormat("yyyy.MM.dd").format(customer.recentInquiryAt!.toLocal())}',
                                            ),
                                            const SizedBox(height: 8),
                                            const Align(
                                              alignment: Alignment.centerRight,
                                              child: Text(
                                                '상세  ›',
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
