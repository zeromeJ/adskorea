import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants/colors.dart';
import 'models/admin_user.dart';
import 'screens/inquiry_list_screen.dart';
import 'screens/inquiry_detail_screen.dart';
import 'screens/customer_list_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/admin_management_service.dart';
import 'services/auth_service.dart';
import 'services/inquiry_service.dart';
import 'services/customer_service.dart';
import 'services/push_notification_service.dart';
import 'services/website_content_service.dart';
import 'screens/onboarding_screen.dart';

class AdsInquiryAdminApp extends StatefulWidget {
  const AdsInquiryAdminApp({super.key});

  @override
  State<AdsInquiryAdminApp> createState() => _AdsInquiryAdminAppState();
}

class _AdsInquiryAdminAppState extends State<AdsInquiryAdminApp> {
  final ApiClient _apiClient = ApiClient();
  late final AuthService _authService = AuthService(_apiClient);
  late final InquiryService _inquiryService = InquiryService(_apiClient);
  late final CustomerService _customerService = CustomerService(_apiClient);
  late final WebsiteContentService _websiteContentService =
      WebsiteContentService(_apiClient);
  late final AdminManagementService _adminManagementService =
      AdminManagementService(_apiClient);
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  late final PushNotificationService _pushNotificationService =
      PushNotificationService(
    _apiClient,
    onInquiryChanged: _refreshInquiryList,
    onOpenInquiry: _openInquiry,
  );
  bool _isLoading = true;
  bool _isLoggedIn = false;
  AdminUser? _currentAdmin;
  int _inquiryRefreshVersion = 0;
  int _customerRefreshVersion = 0;
  int _homeIndex = 0;
  final SharedPreferencesAsync _preferences = SharedPreferencesAsync();
  bool _checkingOnboarding = false;

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
      unawaited(
          _pushNotificationService.initializeForAuthenticatedAdmin(token));
      _scheduleOnboarding();
    }
  }

  Future<void> _setLoggedIn(bool value) async {
    final admin = value ? await _authService.me() : null;
    if (!mounted) return;
    setState(() {
      _isLoggedIn = value && admin != null;
      _currentAdmin = admin;
      _homeIndex = 0;
    });
    final token = _apiClient.token;
    if (value && token != null) {
      unawaited(
          _pushNotificationService.initializeForAuthenticatedAdmin(token));
      _scheduleOnboarding();
    }
  }

  void _scheduleOnboarding() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      unawaited(_maybeShowOnboarding());
    });
  }

  Future<void> _maybeShowOnboarding() async {
    if (_checkingOnboarding || !_isLoggedIn) return;
    _checkingOnboarding = true;
    try {
      final onboardingKey =
          'admin_onboarding_completed_${_currentAdmin?.id ?? 'unknown'}';
      final completed = await _preferences.getBool(onboardingKey) ?? false;
      if (completed || !mounted) return;
      final result = await _navigatorKey.currentState?.push<bool>(
        MaterialPageRoute(builder: (_) => const OnboardingScreen()),
      );
      if (result == true) {
        await _preferences.setBool(onboardingKey, true);
      }
    } finally {
      _checkingOnboarding = false;
    }
  }

  void _openInquiry(String inquiryId) {
    if (!_isLoggedIn) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (_) => InquiryDetailScreen(
            adminManagementService: _adminManagementService,
            currentAdmin: _currentAdmin!,
            inquiryId: inquiryId,
            inquiryService: _inquiryService,
            customerService: _customerService,
          ),
        ),
      );
    });
  }

  void _refreshInquiryList() {
    if (!mounted) return;
    setState(() {
      _inquiryRefreshVersion++;
      _customerRefreshVersion++;
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
      title: '아델슨 관리자 앱',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        scaffoldBackgroundColor: AppColors.background,
        textTheme: const TextTheme(
          bodyMedium: TextStyle(fontSize: 17, height: 1.45),
          bodyLarge: TextStyle(fontSize: 17, height: 1.4),
          labelLarge: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primaryDeep,
          foregroundColor: Colors.white,
          centerTitle: false,
          toolbarHeight: 64,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.line),
          ),
        ),
        dialogTheme: DialogThemeData(
          insetPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          actionsPadding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          titleTextStyle: const TextStyle(
            color: AppColors.text,
            fontSize: 21,
            height: 1.35,
            fontWeight: FontWeight.w800,
          ),
          contentTextStyle: const TextStyle(
            color: AppColors.subText,
            fontSize: 17,
            height: 1.55,
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size(0, 52),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 52),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            minimumSize: const Size(0, 52),
            textStyle: const TextStyle(fontSize: 17),
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          height: 76,
          indicatorColor: AppColors.primary,
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            return TextStyle(
              fontSize: 17,
              fontWeight: states.contains(WidgetState.selected)
                  ? FontWeight.w900
                  : FontWeight.w700,
              color: AppColors.text,
            );
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            return IconThemeData(
              size: 28,
              color: states.contains(WidgetState.selected)
                  ? Colors.white
                  : AppColors.subText,
            );
          }),
        ),
      ),
      home: _isLoading
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _isLoggedIn
              ? IndexedStack(
                  index: _homeIndex,
                  children: [
                    InquiryListScreen(
                      currentAdmin: _currentAdmin!,
                      authService: _authService,
                      adminManagementService: _adminManagementService,
                      inquiryService: _inquiryService,
                      customerService: _customerService,
                      pushNotificationService: _pushNotificationService,
                      refreshVersion: _inquiryRefreshVersion,
                      websiteContentService: _websiteContentService,
                      onOpenCustomers: () => setState(() {
                        _homeIndex = 1;
                        _customerRefreshVersion++;
                      }),
                      onLogout: () => _setLoggedIn(false),
                    ),
                    CustomerListScreen(
                      currentAdmin: _currentAdmin!,
                      customerService: _customerService,
                      inquiryService: _inquiryService,
                      adminManagementService: _adminManagementService,
                      refreshVersion: _customerRefreshVersion,
                      onOpenInquiries: () => setState(() => _homeIndex = 0),
                    ),
                  ],
                )
              : LoginScreen(
                  authService: _authService,
                  onLoggedIn: () => _setLoggedIn(true),
                ),
    );
  }
}
