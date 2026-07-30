import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  static const _items = [
    (
      icon: Icons.assignment_outlined,
      title: '문의 확인',
      body: '문의 화면에서 배정 전과 미처리 문의를 먼저 확인하세요.',
    ),
    (
      icon: Icons.person_add_alt_1_outlined,
      title: '담당자 배정',
      body: '문의 상세에서 담당자를 선택하고 배정 버튼으로 확정하세요.',
    ),
    (
      icon: Icons.task_alt_outlined,
      title: '기록과 완료',
      body: '고객과 상담한 결과를 기록한 뒤 처리가 끝나면 완료하세요.',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final last = _page == _items.length - 1;
    return Scaffold(
      appBar: AppBar(title: const Text('사용법')),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed: () {
            if (last) {
              Navigator.pop(context, true);
            } else {
              _controller.nextPage(
                duration: const Duration(milliseconds: 180),
                curve: Curves.easeOut,
              );
            }
          },
          child: Text(last ? '시작' : '다음'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _controller,
              onPageChanged: (value) => setState(() => _page = value),
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
                  child: Column(
                    children: [
                      Icon(item.icon, size: 82),
                      const SizedBox(height: 28),
                      Text(
                        item.title,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        item.body,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 19, height: 1.6),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              '${_page + 1} / ${_items.length}',
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
            ),
          ),
        ],
      ),
    );
  }
}
