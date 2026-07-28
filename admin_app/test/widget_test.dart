import 'package:flutter_test/flutter_test.dart';
import 'package:ads_inquiry_admin/models/inquiry.dart';

void main() {
  test('inquiry status labels are Korean', () {
    expect(inquiryStatusLabel(InquiryStatus.pending), '진행 중');
    expect(inquiryStatusLabel(InquiryStatus.completed), '처리 완료');
  });

  test('assigned admin label shows only display name', () {
    final now = DateTime(2026);
    final inquiry = Inquiry(
      id: 'inquiry',
      companyName: '',
      contactPerson: '',
      status: InquiryStatus.pending,
      assignedAdminId: 'admin',
      assignedAdminUsername: 'login-id',
      assignedAdminDisplayName: '김관리',
      createdAt: now,
      updatedAt: now,
    );

    expect(inquiry.assignedAdminLabel, '김관리');
    expect(inquiry.assignedAdminLabel, isNot(contains('login-id')));
  });
}
