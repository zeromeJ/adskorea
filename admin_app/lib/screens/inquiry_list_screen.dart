import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/colors.dart';
import '../models/admin_user.dart';
import '../models/inquiry.dart';
import '../services/admin_management_service.dart';
import '../services/auth_service.dart';
import '../services/customer_service.dart';
import '../services/inquiry_service.dart';
import '../services/push_notification_service.dart';
import '../services/website_content_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/inquiry_card.dart';
import '../widgets/loading_view.dart';
import 'activity_log_screen.dart';
import 'admin_list_screen.dart';
import 'assignment_picker_screen.dart';
import 'inquiry_detail_screen.dart';
import 'settings_screen.dart';
import 'website_management_screen.dart';

class InquiryListScreen extends StatefulWidget {
  const InquiryListScreen({
    required this.authService,
    required this.adminManagementService,
    required this.currentAdmin,
    required this.inquiryService,
    required this.customerService,
    required this.refreshVersion,
    required this.pushNotificationService,
    required this.websiteContentService,
    required this.onLogout,
    required this.onOpenCustomers,
    super.key,
  });

  final AuthService authService;
  final AdminManagementService adminManagementService;
  final AdminUser currentAdmin;
  final InquiryService inquiryService;
  final CustomerService customerService;
  final int refreshVersion;
  final PushNotificationService pushNotificationService;
  final WebsiteContentService websiteContentService;
  final VoidCallback onLogout;
  final VoidCallback onOpenCustomers;

  @override
  State<InquiryListScreen> createState() => _InquiryListScreenState();
}

class _InquiryListScreenState extends State<InquiryListScreen>
    with WidgetsBindingObserver {
  final _searchController = TextEditingController();
  late String _scope;
  late String _status;
  String _searchQuery = '';
  bool _isLoading = true;
  bool _isRefreshing = false;
  String? _error;
  List<Inquiry> _items = [];
  InquiryListCounts _counts = const InquiryListCounts();
  InquiryWorkSummary _summary = const InquiryWorkSummary();
  bool _selectionMode = false;
  final Set<String> _selectedIds = {};

  @override
  void initState() {
    super.initState();
    _scope = widget.currentAdmin.canManageInquiries ? 'ALL' : 'MINE';
    _status = widget.currentAdmin.canManageInquiries ? 'ALL' : 'PENDING';
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  @override
  void didUpdateWidget(covariant InquiryListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.refreshVersion != oldWidget.refreshVersion) {
      _load(showLoading: false);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _load(showLoading: false);
    }
  }

  Future<void> _load({bool showLoading = true}) async {
    if (showLoading && _items.isEmpty) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    } else {
      setState(() {
        _isRefreshing = true;
        _error = null;
      });
    }
    try {
      final result = await widget.inquiryService.fetchInquiries(
        scope: _scope,
        status: _status,
        search: _searchQuery,
      );
      final sortedItems = [...result.items]..sort((left, right) {
          final priority =
              left.attentionPriority.compareTo(right.attentionPriority);
          if (priority != 0) return priority;
          return left.status == InquiryStatus.completed
              ? right.createdAt.compareTo(left.createdAt)
              : left.lastActionAt.compareTo(right.lastActionAt);
        });
      if (!mounted) return;
      setState(() {
        _items = sortedItems;
        _counts = result.counts;
        _summary = result.summary;
        _selectedIds.removeWhere(
          (id) => !_items.any((item) => item.id == id),
        );
      });
    } catch (_) {
      if (mounted) setState(() => _error = '문의 목록을 불러오지 못했습니다.');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
        });
      }
    }
  }

  Future<void> _search() async {
    FocusManager.instance.primaryFocus?.unfocus();
    _searchQuery = _searchController.text.trim();
    await _load();
  }

  Future<void> _clearSearch() async {
    _searchController.clear();
    _searchQuery = '';
    await _load();
  }

  Future<void> _resetFilters() async {
    _searchController.clear();
    setState(() {
      _searchQuery = '';
      _scope = widget.currentAdmin.canManageInquiries ? 'ALL' : 'MINE';
      _status = widget.currentAdmin.canManageInquiries ? 'ALL' : 'PENDING';
      _selectionMode = false;
      _selectedIds.clear();
    });
    await _load();
  }

  Future<void> _openPhone(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    await launchUrl(Uri.parse('tel:$phone'));
  }

  Future<void> _openInquiry(Inquiry inquiry) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryDetailScreen(
          adminManagementService: widget.adminManagementService,
          currentAdmin: widget.currentAdmin,
          inquiryId: inquiry.id,
          inquiryService: widget.inquiryService,
          customerService: widget.customerService,
        ),
      ),
    );
    await _load(showLoading: false);
  }

  bool _canComplete(Inquiry inquiry) {
    if (inquiry.status != InquiryStatus.pending ||
        inquiry.assignedAdminId == null) {
      return false;
    }
    return widget.currentAdmin.isSuperAdmin ||
        inquiry.assignedAdminId == widget.currentAdmin.id;
  }

  Future<void> _completeInquiry(Inquiry inquiry) async {
    if (!_canComplete(inquiry)) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('처리를 완료할까요?'),
        content: Text(
          '${inquiry.contactPersonLabel}님의 문의를 완료 처리합니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('처리 완료'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await widget.inquiryService.updateInquiry(
        inquiry.id,
        status: InquiryStatus.completed,
      );
      await _load(showLoading: false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('처리 완료되었습니다.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('완료 처리하지 못했습니다.')),
      );
    }
  }

  void _changeScope(String scope) {
    if (_scope == scope) return;
    setState(() {
      _scope = scope;
      _status = scope == 'ALL' ? 'ALL' : 'PENDING';
      _selectionMode = false;
      _selectedIds.clear();
    });
    _load();
  }

  Future<void> _openSummary(String type) async {
    setState(() {
      _selectionMode = false;
      _selectedIds.clear();
      if (type == 'MINE') {
        _scope = 'MINE';
        _status = 'PENDING';
      } else {
        _scope = widget.currentAdmin.canManageInquiries ? 'ALL' : 'MINE';
        _status = type;
      }
    });
    await _load();
  }

  void _toggleSelection(String id) {
    setState(() {
      if (!_selectedIds.add(id)) _selectedIds.remove(id);
    });
  }

  Future<List<AdminUser>> _loadAdmins() async {
    final admins =
        await widget.adminManagementService.fetchAssignmentCandidates();
    return admins.where((admin) => admin.isActive).toList()
      ..sort((left, right) => left.displayLabel.compareTo(right.displayLabel));
  }

  Future<void> _bulkAssign() async {
    if (_selectedIds.isEmpty) return;
    try {
      final admins = await _loadAdmins();
      if (!mounted) return;
      final selectedItems =
          _items.where((item) => _selectedIds.contains(item.id)).toList();
      final assigneeIds =
          selectedItems.map((item) => item.assignedAdminId).toSet();
      final currentAdminId = assigneeIds.length == 1 ? assigneeIds.first : null;
      final choice = await Navigator.of(context).push<AssignmentChoice>(
        MaterialPageRoute(
          builder: (_) => AssignmentPickerScreen(
            admins: admins,
            currentAdminId: currentAdminId,
            changeCount: selectedItems.length,
          ),
        ),
      );
      if (choice == null) return;
      final changed = await widget.inquiryService.bulkAssignInquiries(
        _selectedIds.toList(),
        choice.adminId,
      );
      if (!mounted) return;
      setState(() {
        _selectionMode = false;
        _selectedIds.clear();
      });
      await _load(showLoading: false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$changed건의 담당자를 변경했습니다.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('담당자를 변경하지 못했습니다.')),
      );
    }
  }

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('로그아웃하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await widget.authService.logout();
    widget.onLogout();
  }

  int _countForStatus(String status) => switch (status) {
        'UNASSIGNED' => _counts.unassigned,
        'PENDING' => _counts.pending,
        'COMPLETED' => _counts.completed,
        _ => _counts.all,
      };

  String _labelForStatus(String status) => switch (status) {
        'UNASSIGNED' => '배정 전',
        'PENDING' => '진행 중',
        'COMPLETED' => '완료',
        _ => '전체',
      };

  bool get _isAllInquiryView =>
      widget.currentAdmin.canManageInquiries && _scope == 'ALL';

  List<String> get _visibleStatuses => _isAllInquiryView
      ? const ['ALL', 'UNASSIGNED', 'PENDING', 'COMPLETED']
      : const ['PENDING', 'COMPLETED'];

  bool get _hasFilters =>
      _searchQuery.isNotEmpty ||
      (widget.currentAdmin.canManageInquiries
          ? _scope != 'ALL' || _status != 'ALL'
          : _status != 'PENDING');

  String get _conditionLabel {
    final scopeLabel = _scope == 'ALL' ? '전체 문의' : '내 문의';
    if (_status == 'STALE_1D') return '$scopeLabel · 1일 미처리';
    if (_status == 'STALE_3D') return '$scopeLabel · 3일 미처리';
    return '$scopeLabel · ${_labelForStatus(_status)}';
  }

  String get _emptyMessage {
    if (_searchQuery.isNotEmpty) return '검색 결과가 없습니다.';
    return switch (_status) {
      'UNASSIGNED' => '배정 전 문의가 없습니다.',
      'PENDING' => '진행 중 문의가 없습니다.',
      'COMPLETED' => '완료된 문의가 없습니다.',
      'STALE_1D' => '1일 미처리 문의가 없습니다.',
      'STALE_3D' => '3일 미처리 문의가 없습니다.',
      _ => '접수된 문의가 없습니다.',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: _drawer(),
      appBar: AppBar(
        title: Text(_scope == 'ALL' ? '전체 문의' : '내 문의'),
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_selectionMode)
            SafeArea(
              top: false,
              bottom: false,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
                color: AppColors.primaryDeep,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      '${_selectedIds.length}건 선택됨',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white),
                            ),
                            onPressed: () => setState(_selectedIds.clear),
                            child: const Text('선택 해제'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: FilledButton(
                            onPressed:
                                _selectedIds.isEmpty ? null : _bulkAssign,
                            child: const Text('일괄 변경'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          NavigationBar(
            height: 76,
            selectedIndex: 0,
            onDestinationSelected: (index) {
              if (index == 1) widget.onOpenCustomers();
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
        ],
      ),
      body: SafeArea(
        top: false,
        child: _isLoading
            ? const LoadingView()
            : Column(
                children: [
                  if (_isRefreshing)
                    const LinearProgressIndicator(
                      semanticsLabel: '새로 불러오는 중',
                    ),
                  if (_isRefreshing)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Text('새로 불러오는 중'),
                    ),
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: () => _load(showLoading: false),
                      child: CustomScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          SliverToBoxAdapter(child: _topControls()),
                          if (_error != null && _items.isNotEmpty)
                            SliverToBoxAdapter(
                              child: Container(
                                margin:
                                    const EdgeInsets.fromLTRB(16, 0, 16, 12),
                                padding: const EdgeInsets.all(12),
                                color: const Color(0xFFFFE9E4),
                                child: Row(
                                  children: [
                                    Expanded(child: Text(_error!)),
                                    TextButton(
                                      onPressed: _load,
                                      child: const Text('다시 불러오기'),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (_error != null && _items.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child:
                                  ErrorView(message: _error!, onRetry: _load),
                            )
                          else if (_items.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: EmptyState(
                                message: _emptyMessage,
                                actionLabel: _searchQuery.isNotEmpty
                                    ? '검색 초기화'
                                    : '전체 보기',
                                onAction: _resetFilters,
                              ),
                            )
                          else
                            SliverPadding(
                              padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
                              sliver: SliverList.separated(
                                itemCount: _items.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final inquiry = _items[index];
                                  return InquiryCard(
                                    inquiry: inquiry,
                                    onOpen: () => _openInquiry(inquiry),
                                    onCall: inquiry.phone?.isNotEmpty == true
                                        ? () => _openPhone(inquiry.phone)
                                        : null,
                                    onComplete: _canComplete(inquiry)
                                        ? () => _completeInquiry(inquiry)
                                        : null,
                                    showAssignment: _isAllInquiryView,
                                    showDuplicateDetection:
                                        widget.currentAdmin.isSuperAdmin &&
                                            inquiry.hasPendingDuplicate,
                                    selectionMode: _selectionMode,
                                    selected: _selectedIds.contains(inquiry.id),
                                    onToggleSelection: () =>
                                        _toggleSelection(inquiry.id),
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _topControls() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            '업무 요약',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          LayoutBuilder(
            builder: (context, constraints) {
              final width = (constraints.maxWidth - 10) / 2;
              return Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _summaryButton(
                    width,
                    '배정 전',
                    _summary.unassigned,
                    () => _openSummary('UNASSIGNED'),
                  ),
                  _summaryButton(
                    width,
                    '1일 미처리',
                    _summary.staleOneDay,
                    () => _openSummary('STALE_1D'),
                  ),
                  _summaryButton(
                    width,
                    '3일 미처리',
                    _summary.staleThreeDay,
                    () => _openSummary('STALE_3D'),
                  ),
                  _summaryButton(
                    width,
                    '내 진행 중',
                    _summary.minePending,
                    () => _openSummary('MINE'),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _searchController,
            textInputAction: TextInputAction.search,
            onChanged: (_) => setState(() {}),
            onSubmitted: (_) => _search(),
            decoration: InputDecoration(
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
            onPressed: _isRefreshing ? null : _search,
            child: const Text('검색'),
          ),
          if (widget.currentAdmin.canManageInquiries) ...[
            const SizedBox(height: 20),
            const Text(
              '문의 범위',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'ALL',
                    label: Text('전체 문의'),
                    icon: Icon(Icons.list_alt_outlined),
                  ),
                  ButtonSegment(
                    value: 'MINE',
                    label: Text('내 문의'),
                    icon: Icon(Icons.person_outline),
                  ),
                ],
                selected: {_scope},
                showSelectedIcon: false,
                onSelectionChanged: (selected) => _changeScope(selected.first),
              ),
            ),
          ],
          const SizedBox(height: 18),
          Row(
            children: [
              const Expanded(
                child: Text(
                  '처리 상태',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                ),
              ),
              if (_isAllInquiryView)
                TextButton(
                  onPressed: () => setState(() {
                    _selectionMode = !_selectionMode;
                    _selectedIds.clear();
                  }),
                  child: Text(_selectionMode ? '선택 끝내기' : '여러 건 선택'),
                ),
            ],
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _visibleStatuses.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final status = _visibleStatuses[index];
                return ChoiceChip(
                  selected: _status == status,
                  showCheckmark: false,
                  label: Text(
                    '${_labelForStatus(status)} ${_countForStatus(status)}',
                  ),
                  onSelected: (_) {
                    setState(() {
                      _status = status;
                      _selectionMode = false;
                      _selectedIds.clear();
                    });
                    _load();
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEEF3EE),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _conditionLabel,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
                if (_hasFilters)
                  TextButton(
                    onPressed: _resetFilters,
                    child: const Text('초기화'),
                  ),
              ],
            ),
          ),
          if (_status == 'UNASSIGNED') ...[
            const SizedBox(height: 8),
            const Text('담당자가 아직 정해지지 않은 문의입니다.'),
          ],
        ],
      ),
    );
  }

  Widget _summaryButton(
    double width,
    String label,
    int count,
    VoidCallback onTap,
  ) {
    return SizedBox(
      width: width,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          alignment: Alignment.center,
          padding: const EdgeInsets.all(16),
          minimumSize: const Size(0, 96),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        onPressed: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              '$count건',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawer() {
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.currentAdmin.displayLabel,
                    style: const TextStyle(
                      fontSize: 21,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('로그인 ID  ${widget.currentAdmin.username}'),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  if (widget.currentAdmin.isSuperAdmin) ...[
                    _drawerGroup('운영'),
                    _drawerTile(
                      icon: Icons.manage_accounts_outlined,
                      title: '관리자',
                      onTap: () => _pushDrawer(
                        AdminListScreen(
                          service: widget.adminManagementService,
                          currentAdmin: widget.currentAdmin,
                        ),
                      ),
                    ),
                  ],
                  if (widget.currentAdmin.canManageWebsite) ...[
                    if (!widget.currentAdmin.isSuperAdmin) _drawerGroup('운영'),
                    _drawerTile(
                      icon: Icons.web_outlined,
                      title: '홈페이지',
                      onTap: () => _pushDrawer(
                        WebsiteManagementScreen(
                          service: widget.websiteContentService,
                        ),
                      ),
                    ),
                  ],
                  if (widget.currentAdmin.isSuperAdmin) ...[
                    _drawerGroup('기록'),
                    _drawerTile(
                      icon: Icons.history,
                      title: '처리 기록',
                      onTap: () => _pushDrawer(
                        ActivityLogScreen(
                          adminService: widget.adminManagementService,
                          currentAdmin: widget.currentAdmin,
                          inquiryService: widget.inquiryService,
                          customerService: widget.customerService,
                        ),
                      ),
                    ),
                  ],
                  _drawerGroup('기타'),
                  _drawerTile(
                    icon: Icons.settings_outlined,
                    title: '설정',
                    onTap: () => _pushDrawer(
                      SettingsScreen(
                        pushNotificationService: widget.pushNotificationService,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            _drawerTile(
              icon: Icons.logout,
              title: '로그아웃',
              onTap: () {
                Navigator.pop(context);
                _confirmLogout();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerGroup(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.subText,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _drawerTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      minTileHeight: 58,
      leading: Icon(icon, size: 27),
      title: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
      ),
      onTap: onTap,
    );
  }

  void _pushDrawer(Widget screen) {
    Navigator.pop(context);
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}
