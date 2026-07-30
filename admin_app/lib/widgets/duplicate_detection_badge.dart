import 'package:flutter/material.dart';

class DuplicateDetectionBadge extends StatelessWidget {
  const DuplicateDetectionBadge({
    this.compact = false,
    super.key,
  });

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFFE7A8),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: const Color(0xFFE0A94F),
          width: 1.2,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.warning_amber_rounded,
            size: compact ? 15 : 17,
            color: const Color(0xFF7A4B00),
          ),
          SizedBox(width: compact ? 4 : 5),
          Text(
            '중복 감지',
            style: TextStyle(
              color: const Color(0xFF7A4B00),
              fontSize: compact ? 12 : 13,
              fontWeight: FontWeight.w900,
              height: 1,
            ),
          ),
        ],
      ),
    );
  }
}
