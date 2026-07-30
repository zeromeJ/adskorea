import 'package:flutter/material.dart';
import '../models/admin_user.dart';

class AssignmentChoice {
  const AssignmentChoice(this.adminId);
  final String? adminId;
}

class AssignmentPickerScreen extends StatefulWidget {
  const AssignmentPickerScreen({
    required this.admins,
    required this.currentAdminId,
    this.changeCount = 1,
    super.key,
  });

  final List<AdminUser> admins;
  final String? currentAdminId;
  final int changeCount;

  @override
  State<AssignmentPickerScreen> createState() => _AssignmentPickerScreenState();
}

class _AssignmentPickerScreenState extends State<AssignmentPickerScreen> {
  String? _selectedAdminId;

  @override
  void initState() {
    super.initState();
    _selectedAdminId = widget.currentAdminId;
  }

  String _adminLabel(String? id) {
    if (id == null) return '미배정';
    return widget.admins
            .where((admin) => admin.id == id)
            .map((admin) => admin.displayLabel)
            .firstOrNull ??
        '미배정';
  }

  Future<void> _confirm() async {
    if (_selectedAdminId == widget.currentAdminId) return;
    final nextLabel = _adminLabel(_selectedAdminId);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('담당자를 바꿀까요?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '변경 ${widget.changeCount}건',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 14),
            Text('기존 담당자  ${_adminLabel(widget.currentAdminId)}'),
            const SizedBox(height: 8),
            Text(
              '새 담당자  $nextLabel',
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
                widget.changeCount == 1 ? '배정' : '${widget.changeCount}건 변경'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      Navigator.pop(context, AssignmentChoice(_selectedAdminId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedLabel = _adminLabel(_selectedAdminId);
    return Scaffold(
      appBar: AppBar(title: const Text('담당자')),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed:
              _selectedAdminId == widget.currentAdminId ? null : _confirm,
          child: Text(
            _selectedAdminId == null ? '미배정으로 변경' : '$selectedLabel에게 배정',
            maxLines: 1,
          ),
        ),
      ),
      body: RadioGroup<String?>(
        groupValue: _selectedAdminId,
        onChanged: (value) => setState(() => _selectedAdminId = value),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              '담당자를 선택하세요.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            const Text('행 전체를 눌러 선택할 수 있습니다.'),
            const SizedBox(height: 16),
            _adminTile(
              title: '미배정',
              subtitle: '담당자를 지정하지 않습니다.',
              value: null,
            ),
            const SizedBox(height: 10),
            ...widget.admins.map(
              (admin) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _adminTile(
                  title: admin.displayLabel,
                  subtitle:
                      '진행 중 ${admin.pendingInquiryCount}건 · 3일 미처리 ${admin.staleThreeDayCount}건',
                  value: admin.id,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _adminTile({
    required String title,
    required String subtitle,
    required String? value,
  }) {
    final selected = _selectedAdminId == value;
    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => setState(() => _selectedAdminId = value),
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 72),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Row(
              children: [
                Radio<String?>(value: value),
                const SizedBox(width: 4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(subtitle),
                    ],
                  ),
                ),
                if (selected)
                  const Text(
                    '선택됨',
                    style: TextStyle(fontWeight: FontWeight.w900),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
