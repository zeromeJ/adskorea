import 'package:flutter_test/flutter_test.dart';
import 'package:ads_inquiry_admin/models/inquiry.dart';

void main() {
  test('inquiry status labels are Korean', () {
    expect(inquiryStatusLabel(InquiryStatus.pending), '처리 전');
    expect(inquiryStatusLabel(InquiryStatus.completed), '처리 완료');
  });
}
