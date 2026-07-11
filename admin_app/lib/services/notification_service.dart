import 'dart:async';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_client.dart';

class NotificationService {
  NotificationService(this.client, {required this.onOpenInquiry});

  final ApiClient client;
  final void Function(String inquiryId) onOpenInquiry;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _messageSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  bool _initialized = false;

  static const _channel = AndroidNotificationChannel(
    'new_inquiries',
    '새 문의 알림',
    description: '홈페이지에 새 문의가 등록되었을 때 알립니다.',
    importance: Importance.high,
  );

  Future<void> initialize() async {
    if (_initialized || !Platform.isAndroid) return;

    try {
      await Firebase.initializeApp();
      await _localNotifications.initialize(
        settings: const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        ),
        onDidReceiveNotificationResponse: (response) {
          final inquiryId = response.payload;
          if (inquiryId != null && inquiryId.isNotEmpty) {
            onOpenInquiry(inquiryId);
          }
        },
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(_channel);

      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.denied) return;

      final token = await messaging.getToken();
      if (token != null) await _registerToken(token);

      _tokenSubscription = messaging.onTokenRefresh.listen(_registerToken);
      _messageSubscription = FirebaseMessaging.onMessage.listen(_showMessage);
      _openedSubscription =
          FirebaseMessaging.onMessageOpenedApp.listen(_openMessage);

      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) _openMessage(initialMessage);

      _initialized = true;
    } catch (error) {
      // Keep the admin app usable until Firebase configuration is supplied.
      // ignore: avoid_print
      print('Push notification setup failed: $error');
    }
  }

  Future<void> _registerToken(String token) async {
    try {
      await client.post('/api/admin/device-token', {
        'token': token,
        'platform': 'android',
      });
    } catch (error) {
      // Token refresh will retry registration on a later app session.
      // ignore: avoid_print
      print('Device token registration failed: $error');
    }
  }

  Future<void> _showMessage(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    await _localNotifications.show(
      id: message.messageId.hashCode,
      title: notification.title ?? 'ADS 문의관리',
      body: notification.body ?? '새로운 문의가 등록되었습니다.',
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'new_inquiries',
          '새 문의 알림',
          channelDescription: '홈페이지에 새 문의가 등록되었을 때 알립니다.',
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
      payload: message.data['inquiryId'],
    );
  }

  void _openMessage(RemoteMessage message) {
    final inquiryId = message.data['inquiryId'];
    if (inquiryId != null && inquiryId.isNotEmpty) {
      onOpenInquiry(inquiryId);
    }
  }

  void dispose() {
    _tokenSubscription?.cancel();
    _messageSubscription?.cancel();
    _openedSubscription?.cancel();
  }
}
