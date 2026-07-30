import 'package:flutter/material.dart';

class AdaptiveActionButtons extends StatelessWidget {
  const AdaptiveActionButtons({
    required this.children,
    this.spacing = 10,
    this.forceVertical = false,
    super.key,
  });

  final List<Widget> children;
  final double spacing;
  final bool forceVertical;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final textScale = MediaQuery.textScalerOf(context).scale(17) / 17;
        final vertical = forceVertical ||
            children.length > 2 ||
            constraints.maxWidth < 360 ||
            textScale >= 1.3;
        if (vertical) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var index = 0; index < children.length; index++) ...[
                children[index],
                if (index < children.length - 1) SizedBox(height: spacing),
              ],
            ],
          );
        }
        return Row(
          children: [
            for (var index = 0; index < children.length; index++) ...[
              Expanded(child: children[index]),
              if (index < children.length - 1) SizedBox(width: spacing),
            ],
          ],
        );
      },
    );
  }
}
