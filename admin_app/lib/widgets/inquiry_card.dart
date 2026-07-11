import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../models/inquiry.dart';
import 'status_chip.dart';

class InquiryCard extends StatelessWidget {
  const InquiryCard({
    required this.inquiry,
    required this.onOpen,
    required this.onCall,
    required this.onComplete,
    super.key,
  });

  final Inquiry inquiry;
  final VoidCallback onOpen;
  final VoidCallback? onCall;
  final VoidCallback? onComplete;

  @override
  Widget build(BuildContext context) {
    final date =
        DateFormat('yyyy.MM.dd HH:mm').format(inquiry.createdAt.toLocal());

    return Card(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.line),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                StatusChip(status: inquiry.status),
                const Spacer(),
                Text(date,
                    style: const TextStyle(
                        color: AppColors.subText, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              inquiry.companyName,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text('담당자: ${inquiry.contactPerson}'),
            Text(
                '연락처: ${inquiry.phone?.isNotEmpty == true ? inquiry.phone : "연락처 없음"}'),
            if (inquiry.productInterest?.isNotEmpty == true)
              Text('관심 제품: ${inquiry.productInterest}'),
            if (inquiry.estimatedQuantity?.isNotEmpty == true)
              Text('예상 수량: ${inquiry.estimatedQuantity}'),
            if (inquiry.message?.isNotEmpty == true) ...[
              const SizedBox(height: 8),
              Text(
                inquiry.message!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.subText),
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton(
                  onPressed: onCall,
                  child: Text(onCall == null ? '연락처 없음' : '전화하기'),
                ),
                OutlinedButton(onPressed: onOpen, child: const Text('상세 보기')),
                if (onComplete != null)
                  FilledButton(
                      onPressed: onComplete, child: const Text('처리 완료')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
