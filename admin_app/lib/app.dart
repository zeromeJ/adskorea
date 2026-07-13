import 'dart:async';
import 'package:flutter/material.dart';
import 'constants/colors.dart';
import 'models/admin_user.dart';
import 'screens/inquiry_list_screen.dart';
import 'screens/inquiry_detail_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/admin_management_service.dart';
import 'services/auth_service.dart';
import 'services/inquiry_service.dart';
import 'services/push_notification_service.dart';

class AdsInquiryAdminApp extends StatefulWidget {
  const AdsInquiryAdminApp({super.key});

  @override
  State<AdsInquiryAdminApp> createState() => _AdsInquiryAdminAppState();
}

class _AdsInquiryAdminAppState extends State<AdsInquiryAdminApp> {
  final ApiClient _apiClient = ApiClient();
  late final AuthService _authService = AuthService(_apiClient);
  late final InquiryService _inquiryService = InquiryService(_apiClient);
  late final AdminManagementService _adminManagementService =
      AdminManagementService(_apiClient);
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  late final PushNotificationService _pushNotificationService =
      PushNotificationService(
    _apiClient,
    onOpenInquiry: _openInquiry,
  );
  bool _isLoading = true;
  bool _isLoggedIn = false;
  AdminUser? _currentAdmin;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    AdminUser? admin;

    try {
      final token = await _authService.loadToken();
      if (token != null && token.isNotEmpty) {
        admin = await _authService.me();
      }
    } catch (_) {
      await _authService.logout();
    } finally {
      if (mounted) {
        setState(() {
          _isLoggedIn = admin != null;
          _currentAdmin = admin;
          _isLoading = false;
        });
      }
    }

    final token = _apiClient.token;
    if (admin != null && token != null) {
      unawaited(_pushNotificationService.initializeForAuthenticatedAdmin(token));
    }
  }

  Future<void> _setLoggedIn(bool value) async {
    final admin = value ? await _authService.me() : null;
    if (!mounted) return;
    setState(() {
      _isLoggedIn = value && admin != null;
      _currentAdmin = admin;
    });
    final token = _apiClient.token;
    if (value && token != null) {
      unawaited(_pushNotificationService.initializeForAuthenticatedAdmin(token));
    }
  }

  void _openInquiry(String inquiryId) {
    if (!_isLoggedIn) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (_) => InquiryDetailScreen(
            inquiryId: inquiryId,
            inquiryService: _inquiryService,
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _pushNotificationService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'ADS 문의관리',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primaryDeep,
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.line),
          ),
        ),
      ),
      home: _isLoading
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _isLoggedIn
              ? InquiryListScreen(
                  currentAdmin: _currentAdmin!,
                  authService: _authService,
                  adminManagementService: _adminManagementService,
                  inquiryService: _inquiryService,
                  onLogout: () => _setLoggedIn(false),
                )
              : LoginScreen(
                  authService: _authService,
                  onLoggedIn: () => _setLoggedIn(true),
                ),
    );
  }
}
