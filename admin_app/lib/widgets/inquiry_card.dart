import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../models/inquiry.dart';
import 'adaptive_action_buttons.dart';
import 'duplicate_detection_badge.dart';
import 'status_chip.dart';

class InquiryCard extends StatelessWidget {
  const InquiryCard({
    required this.inquiry,
    required this.onOpen,
    required this.onCall,
    required this.onComplete,
    this.showAssignment = false,
    this.showDuplicateDetection = false,
    this.selectionMode = false,
    this.selected = false,
    this.onToggleSelection,
    super.key,
  });

  final Inquiry inquiry;
  final VoidCallback onOpen;
  final VoidCallback? onCall;
  final VoidCallback? onComplete;
  final bool showAssignment;
  final bool showDuplicateDetection;
  final bool selectionMode;
  final bool selected;
  final VoidCallback? onToggleSelection;

  String _relative(DateTime value) {
    final duration = DateTime.now().difference(value);
    if (duration.inDays > 0) return '${duration.inDays}일 전';
    if (duration.inHours > 0) return '${duration.inHours}시간 전';
    if (duration.inMinutes > 0) return '${duration.inMinutes}분 전';
    return '방금';
  }

  @override
  Widget build(BuildContext context) {
    final date = DateFormat('M월 d일').format(inquiry.createdAt.toLocal());
    final lastDate = DateFormat('M월 d일').format(inquiry.lastActionAt.toLocal());
    final company = inquiry.companyName.trim();
    final title = company.isNotEmpty ? company : inquiry.contactPersonLabel;
    final subtitle = company.isNotEmpty
        ? '${inquiry.contactPersonLabel} · ${inquiryTypeLabel(inquiry.inquiryType)}'
        : inquiryTypeLabel(inquiry.inquiryType);

    return Card(
      color: selected ? const Color(0xFFE6F0E9) : AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: selected ? AppColors.primary : AppColors.line,
          width: selected ? 2 : 1,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: selectionMode ? onToggleSelection : onOpen,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (selectionMode) ...[
                    Checkbox(
                      value: selected,
                      onChanged: (_) => onToggleSelection?.call(),
                    ),
                    const SizedBox(width: 6),
                  ],
                  Expanded(
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        StatusChip(
                          status: inquiry.status,
                          label: inquiry.attentionLabel,
                        ),
                        if (showDuplicateDetection)
                          const DuplicateDetectionBadge(compact: true),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.text,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 17, height: 1.4),
              ),
              const SizedBox(height: 14),
              if (showAssignment) _info('담당자', inquiry.assignedAdminLabel),
              _info('접수', date),
              _info(
                '마지막 처리',
                '${_relative(inquiry.lastActionAt)} · $lastDate',
              ),
              _info(
                '접수번호',
                inquiry.registrationNumber.isEmpty
                    ? '-'
                    : inquiry.registrationNumber,
              ),
              if (!selectionMode) ...[
                const SizedBox(height: 10),
                AdaptiveActionButtons(
                  children: [
                    OutlinedButton.icon(
                      onPressed: onCall,
                      icon: const Icon(Icons.phone_rounded),
                      label: const Text('전화'),
                    ),
                    FilledButton.icon(
                      onPressed: onComplete,
                      icon: const Icon(Icons.check_circle_outline_rounded),
                      label: const Text('처리 완료'),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _info(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text.rich(
        TextSpan(
          style: const TextStyle(
            color: AppColors.text,
            fontSize: 16,
            height: 1.4,
          ),
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }
}
