import 'package:flutter/material.dart';
import '../constants/colors.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        message,
        style: const TextStyle(color: AppColors.subText, fontSize: 15),
      ),
    );
  }
}
