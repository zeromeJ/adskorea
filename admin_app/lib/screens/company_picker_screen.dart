import 'package:flutter/material.dart';
import '../models/customer.dart';
import '../services/api_client.dart';
import '../services/customer_service.dart';
import '../widgets/empty_state.dart';

class CompanyPickerScreen extends StatefulWidget {
  const CompanyPickerScreen({
    required this.customerId,
    required this.service,
    this.currentCompany,
    super.key,
  });

  final String customerId;
  final CustomerService service;
  final CustomerCompany? currentCompany;

  @override
  State<CompanyPickerScreen> createState() => _CompanyPickerScreenState();
}

class _CompanyPickerScreenState extends State<CompanyPickerScreen> {
  final _searchController = TextEditingController();
  bool _loading = false;
  bool _saving = false;
  List<CustomerCompany> _items = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _search();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    FocusManager.instance.primaryFocus?.unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items =
          await widget.service.searchCompanies(_searchController.text.trim());
      if (mounted) setState(() => _items = items);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _link(CustomerCompany company) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('회사를 연결할까요?'),
        content: Text(
          '기존 회사  ${widget.currentCompany?.name ?? "없음"}\n'
          '새 회사  ${company.name}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('회사 연결'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _saving = true);
    try {
      await widget.service.changeCustomerCompany(
        widget.customerId,
        action: 'LINK',
        companyId: company.id,
      );
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _create() async {
    final controller = TextEditingController(text: _searchController.text);
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('회사 추가'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('같은 회사가 검색 결과에 없는지 먼저 확인해 주세요.'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              autofocus: true,
              decoration: const InputDecoration(labelText: '새 회사명'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('회사 추가'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.isEmpty) return;
    setState(() => _saving = true);
    try {
      await widget.service.changeCustomerCompany(
        widget.customerId,
        action: 'CREATE',
        companyName: name,
      );
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회사 연결')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  '기존 회사 검색',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _searchController,
                  enabled: !_saving,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (_) => _search(),
                  decoration: InputDecoration(
                    hintText: '회사명을 입력하세요.',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isEmpty
                        ? null
                        : IconButton(
                            tooltip: '검색어 지우기',
                            onPressed: () {
                              _searchController.clear();
                              _search();
                            },
                            icon: const Icon(Icons.close),
                          ),
                  ),
                ),
                const SizedBox(height: 10),
                FilledButton(
                  onPressed: _loading || _saving ? null : _search,
                  child: Text(_loading ? '검색 중' : '검색'),
                ),
              ],
            ),
          ),
          Expanded(
            child: _error != null
                ? Center(child: Text(_error!))
                : _items.isEmpty && !_loading
                    ? const EmptyState(message: '검색된 회사가 없습니다.')
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final company = _items[index];
                          return Card(
                            elevation: 0,
                            child: ListTile(
                              minTileHeight: 64,
                              title: Text(
                                company.name,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              subtitle:
                                  Text('등록 담당자 ${company.customerCount}명'),
                              trailing: const Text('선택'),
                              onTap: _saving ? null : () => _link(company),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: OutlinedButton(
          onPressed: _saving ? null : _create,
          child: const Text('회사 추가'),
        ),
      ),
    );
  }
}
