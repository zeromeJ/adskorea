import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../models/inquiry.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({required this.status, super.key});

  final InquiryStatus status;

  @override
  Widget build(BuildContext context) {
    final isCompleted = status == InquiryStatus.completed;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isCompleted ? AppColors.line : AppColors.primary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        inquiryStatusLabel(status),
        style: TextStyle(
          color: isCompleted ? AppColors.subText : Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
