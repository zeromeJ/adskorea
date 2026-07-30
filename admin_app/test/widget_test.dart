import 'package:flutter_test/flutter_test.dart';
import 'package:ads_inquiry_admin/models/completion_log.dart';
import 'package:ads_inquiry_admin/models/customer.dart';
import 'package:ads_inquiry_admin/models/inquiry.dart';
import 'package:ads_inquiry_admin/widgets/inquiry_card.dart';
import 'package:ads_inquiry_admin/models/admin_user.dart';
import 'package:ads_inquiry_admin/screens/assignment_picker_screen.dart';
import 'package:ads_inquiry_admin/screens/consultation_record_screen.dart';
import 'package:ads_inquiry_admin/services/api_client.dart';
import 'package:ads_inquiry_admin/services/inquiry_service.dart';
import 'package:flutter/material.dart';

void main() {
  test('inquiry status labels are Korean', () {
    expect(inquiryStatusLabel(InquiryStatus.pending), '진행 중');
    expect(inquiryStatusLabel(InquiryStatus.completed), '완료');
  });

  test('inquiry attention uses last action time', () {
    final now = DateTime.now();
    final inquiry = Inquiry(
      id: 'stale-inquiry',
      registrationNumber: '2607300001',
      companyName: '테스트 회사',
      contactPerson: '김담당',
      status: InquiryStatus.pending,
      createdAt: now.subtract(const Duration(days: 5)),
      updatedAt: now,
      lastActionAt: now.subtract(const Duration(hours: 73)),
    );

    expect(inquiry.attentionLabel, '3일 미처리');
    expect(inquiry.attentionPriority, 0);
  });

  for (final scale in const [1.0, 1.3, 1.5]) {
    testWidgets('inquiry card supports ${scale * 100}% text', (tester) async {
      final now = DateTime.now();
      final inquiry = Inquiry(
        id: 'inquiry-$scale',
        registrationNumber: '2607300002',
        companyName: '아델슨 테스트 주식회사',
        contactPerson: '김민수',
        inquiryType: 'quote',
        status: InquiryStatus.pending,
        assignedAdminId: 'admin',
        assignedAdminDisplayName: '박담당',
        createdAt: now,
        updatedAt: now,
        lastActionAt: now.subtract(const Duration(hours: 26)),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: Scaffold(
              body: SingleChildScrollView(
                child: SizedBox(
                  width: 390,
                  child: InquiryCard(
                    inquiry: inquiry,
                    onOpen: () {},
                    onCall: () {},
                    onComplete: () {},
                    showAssignment: true,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('1일 미처리'), findsOneWidget);
      expect(find.text('전화'), findsOneWidget);
      expect(find.text('처리 완료'), findsOneWidget);
    });
  }

  testWidgets('assignment picker supports 150% text', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      const MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(1.5)),
          child: AssignmentPickerScreen(
            currentAdminId: null,
            admins: [
              AdminUser(
                id: 'admin',
                username: 'admin',
                displayName: '박담당 관리자',
                pendingInquiryCount: 4,
                staleThreeDayCount: 1,
              ),
            ],
          ),
        ),
      ),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
    expect(find.text('담당자'), findsOneWidget);
    expect(find.textContaining('진행 중 4건'), findsOneWidget);
  });

  testWidgets('consultation record supports 150% text', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(1.5)),
          child: ConsultationRecordScreen(
            inquiryId: 'inquiry',
            service: InquiryService(ApiClient()),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
    expect(find.text('처리 결과'), findsOneWidget);
    expect(find.text('전화 완료'), findsOneWidget);
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
      lastActionAt: now,
    );

    expect(inquiry.assignedAdminLabel, '김관리');
    expect(inquiry.assignedAdminLabel, isNot(contains('login-id')));
  });

  test('admin role permissions stay separated', () {
    const superAdmin = AdminUser(
      id: 'super',
      username: 'super',
      isSuperAdmin: true,
    );
    const assistantAdmin = AdminUser(
      id: 'assistant',
      username: 'assistant',
      isAssistantAdmin: true,
    );
    const normalAdmin = AdminUser(id: 'normal', username: 'normal');

    expect(superAdmin.canManageInquiries, isTrue);
    expect(superAdmin.canManageWebsite, isTrue);
    expect(assistantAdmin.canManageInquiries, isTrue);
    expect(assistantAdmin.canManageWebsite, isTrue);
    expect(normalAdmin.canManageInquiries, isFalse);
    expect(normalAdmin.canManageWebsite, isFalse);
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
