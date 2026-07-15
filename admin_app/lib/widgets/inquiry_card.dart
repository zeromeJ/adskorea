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

  Widget _info(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Text.rich(
        TextSpan(
          style: const TextStyle(
            color: AppColors.text,
            fontSize: 15,
            height: 1.45,
          ),
          children: [
            TextSpan(
              text: '$label  ',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final date =
        DateFormat('yyyy.MM.dd HH:mm').format(inquiry.createdAt.toLocal());

    return Card(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpen,
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
              _info('담당자', inquiry.contactPerson),
              if (inquiry.inquiryType?.isNotEmpty == true)
                _info('문의 유형', inquiryTypeLabel(inquiry.inquiryType)),
              _info(
                '연락처',
                inquiry.phone?.isNotEmpty == true ? inquiry.phone! : '연락처 없음',
              ),
              if (inquiry.productInterest?.isNotEmpty == true)
                _info('관심 제품', inquiry.productInterest!),
              if (inquiry.cargoType?.isNotEmpty == true)
                _info('화물 종류', inquiry.cargoType!),
              if (inquiry.loadPerPallet?.isNotEmpty == true)
                _info('팔레트당 중량', inquiry.loadPerPallet!),
              if (inquiry.estimatedQuantity?.isNotEmpty == true)
                _info('예상 수량', inquiry.estimatedQuantity!),
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
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onCall,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        minimumSize: const Size(0, 48),
                      ),
                      child: Text(
                        onCall == null ? '연락처 없음' : '전화하기',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onOpen,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        minimumSize: const Size(0, 48),
                      ),
                      child: const Text(
                        '상세보기',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  if (onComplete != null) ...[
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton(
                        onPressed: onComplete,
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          minimumSize: const Size(0, 48),
                        ),
                        child: const Text(
                          '처리 완료',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
