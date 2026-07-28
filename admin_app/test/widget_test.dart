import 'package:flutter_test/flutter_test.dart';
import 'package:ads_inquiry_admin/models/completion_log.dart';
import 'package:ads_inquiry_admin/models/customer.dart';
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
      registrationNumber: '2607280001',
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

  test('assignment activity identifies actor, assignee, and inquiry', () {
    final log = InquiryActivityLog.fromJson({
      'id': 'activity',
      'type': 'ASSIGNED',
      'adminUsername': 'super-login',
      'adminDisplayName': '최고관리자',
      'assignedAdminId': 'assigned-admin',
      'assignedAdminDisplayName': '김담당',
      'occurredAt': '2026-07-28T03:00:00.000Z',
      'inquiry': {
        'id': 'inquiry',
        'registrationNumber': '2607280012',
        'companyName': '테스트 회사',
        'contactPerson': '홍길동',
      },
    });

    expect(log.type, InquiryActivityType.assigned);
    expect(log.adminLabel, '최고관리자');
    expect(log.assignedAdminLabel, '김담당');
    expect(log.registrationNumber, '2607280012');
  });

  test('customer duplicate candidate explains matching fields', () {
    final candidate = CustomerDuplicateCandidate.fromJson({
      'id': 'review',
      'matchedPhone': true,
      'matchedEmail': false,
      'matchedCompany': true,
      'candidateCustomer': {
        'id': 'customer',
        'name': '김담당',
        'phone': '010-1234-5678',
        'company': {'id': 'company', 'name': '테스트 회사'},
        'inquiries': [
          {
            'id': 'inquiry',
            'registrationNumber': '2607280001',
            'status': 'COMPLETED',
            'createdAt': '2026-07-28T03:00:00.000Z',
          },
        ],
      },
    });

    expect(candidate.reasonLabel, '전화번호 일치 · 회사명 일치');
    expect(
        candidate.customer.inquiries.single.registrationNumber, '2607280001');
  });

  test('customer merge history keeps each merge independently undoable', () {
    final customer = Customer.fromJson({
      'id': 'baseline',
      'name': '기준 고객',
      'mergeLogsAsTarget': [
        {
          'id': 'merge-1',
          'mergedByDisplayName': '최고관리자',
          'mergedByUsername': 'super',
          'createdAt': '2026-07-29T03:00:00.000Z',
          'undoneAt': null,
          'undoneByDisplayName': null,
          'sourceCustomer': {'id': 'candidate-1', 'name': '후보 고객 1'},
          'movedInquiries': [
            {
              'inquiry': {
                'id': 'inquiry-1',
                'registrationNumber': '2607290001',
                'status': 'PENDING',
                'createdAt': '2026-07-29T02:00:00.000Z',
              },
            },
          ],
        },
        {
          'id': 'merge-2',
          'mergedByDisplayName': '최고관리자',
          'mergedByUsername': 'super',
          'createdAt': '2026-07-29T04:00:00.000Z',
          'undoneAt': '2026-07-29T05:00:00.000Z',
          'undoneByDisplayName': '최고관리자',
          'sourceCustomer': {'id': 'candidate-2', 'name': '후보 고객 2'},
          'movedInquiries': [
            {
              'inquiry': {
                'id': 'inquiry-2',
                'registrationNumber': '2607290002',
                'status': 'COMPLETED',
                'createdAt': '2026-07-29T01:00:00.000Z',
              },
            },
          ],
        },
      ],
    });

    expect(customer.mergeHistory, hasLength(2));
    expect(customer.mergeHistory.first.isUndone, isFalse);
    expect(customer.mergeHistory.last.isUndone, isTrue);
    expect(
      customer.mergeHistory.first.movedInquiries.single.registrationNumber,
      '2607290001',
    );
  });
}
