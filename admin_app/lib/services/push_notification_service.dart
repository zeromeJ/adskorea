import 'dart:async';
import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'api_client.dart';

class PushNotificationService {
  PushNotificationService(
    this.client, {
    required this.onOpenInquiry,
  });

  final ApiClient client;
  final void Function(String inquiryId) onOpenInquiry;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  bool _localNotificationReady = false;

  static const _timeout = Duration(seconds: 10);
  static const _channel = AndroidNotificationChannel(
    'new_inquiries',
    '새 문의 알림',
    description: '홈페이지에 새 문의가 등록되었을 때 알립니다.',
    importance: Importance.high,
  );

  Future<NotificationSettings?> requestPermission() async {
    if (!Platform.isAndroid && !Platform.isIOS && !Platform.isMacOS) {
      return null;
    }

    try {
      return await _messaging
          .requestPermission(
            alert: true,
            badge: true,
            sound: true,
          )
          .timeout(_timeout);
    } catch (error) {
      _log('Push permission request failed', error);
      return null;
    }
  }

  Future<String?> getToken() async {
    try {
      return await _messaging.getToken().timeout(_timeout);
    } catch (error) {
      _log('FCM token fetch failed', error);
      return null;
    }
  }

  Future<void> registerDeviceToken(String authToken) async {
    if (authToken.isEmpty) return;

    final token = await getToken();
    if (token == null || token.isEmpty) return;

    try {
      await client
          .post('/api/admin/device-token', {
            'token': token,
            'platform': Platform.isAndroid ? 'android' : Platform.operatingSystem,
          })
          .timeout(_timeout);
    } catch (error) {
      _log('Device token registration failed', error);
    }
  }

  void listenForTokenRefresh(String authToken) {
    _tokenSubscription?.cancel();
    _tokenSubscription = _messaging.onTokenRefresh.listen((token) async {
      if (authToken.isEmpty || token.isEmpty) return;

      try {
        await client
            .post('/api/admin/device-token', {
              'token': token,
              'platform':
                  Platform.isAndroid ? 'android' : Platform.operatingSystem,
            })
            .timeout(_timeout);
      } catch (error) {
        _log('Device token refresh registration failed', error);
      }
    });
  }

  Future<void> listenForForegroundMessages() async {
    await _ensureLocalNotifications();

    _foregroundSubscription?.cancel();
    _foregroundSubscription =
        FirebaseMessaging.onMessage.listen(_showForegroundMessage);

    _openedSubscription?.cancel();
    _openedSubscription =
        FirebaseMessaging.onMessageOpenedApp.listen(_openMessage);

    try {
      final initialMessage = await _messaging.getInitialMessage().timeout(
            _timeout,
            onTimeout: () => null,
          );
      if (initialMessage != null) {
        _openMessage(initialMessage);
      }
    } catch (error) {
      _log('Initial push message handling failed', error);
    }
  }

  Future<void> initializeForAuthenticatedAdmin(String authToken) async {
    await requestPermission();
    await registerDeviceToken(authToken);
    listenForTokenRefresh(authToken);
    await listenForForegroundMessages();
  }

  Future<void> _ensureLocalNotifications() async {
    if (_localNotificationReady || !Platform.isAndroid) return;

    try {
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
      ).timeout(_timeout);

      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(_channel)
          .timeout(_timeout);

      _localNotificationReady = true;
    } catch (error) {
      _log('Local notification setup failed', error);
    }
  }

  Future<void> _showForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    try {
      await _localNotifications
          .show(
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
          )
          .timeout(_timeout);
    } catch (error) {
      _log('Foreground push display failed', error);
    }
  }

  void _openMessage(RemoteMessage message) {
    final inquiryId = message.data['inquiryId'];
    if (inquiryId is String && inquiryId.isNotEmpty) {
      onOpenInquiry(inquiryId);
    }
  }

  void dispose() {
    _tokenSubscription?.cancel();
    _foregroundSubscription?.cancel();
    _openedSubscription?.cancel();
  }

  void _log(String message, Object error) {
    // ignore: avoid_print
    print('$message: $error');
  }
}
