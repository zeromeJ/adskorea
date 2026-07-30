import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../models/inquiry.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({
    required this.status,
    this.label,
    super.key,
  });

  final InquiryStatus status;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final isCompleted = status == InquiryStatus.completed;
    final effectiveLabel = label ?? inquiryStatusLabel(status);
    final backgroundColor = switch (effectiveLabel) {
      '3일 미처리' => const Color(0xFFC62828),
      '1일 미처리' => const Color(0xFFE87817),
      _ => isCompleted ? AppColors.line : AppColors.primary,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        effectiveLabel,
        style: TextStyle(
          color: isCompleted ? AppColors.subText : Colors.white,
          fontSize: 15,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
