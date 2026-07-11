import 'package:flutter/material.dart';
import 'constants/colors.dart';
import 'screens/inquiry_list_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'services/inquiry_service.dart';

class AdsInquiryAdminApp extends StatefulWidget {
  const AdsInquiryAdminApp({super.key});

  @override
  State<AdsInquiryAdminApp> createState() => _AdsInquiryAdminAppState();
}

class _AdsInquiryAdminAppState extends State<AdsInquiryAdminApp> {
  final ApiClient _apiClient = ApiClient();
  late final AuthService _authService = AuthService(_apiClient);
  late final InquiryService _inquiryService = InquiryService(_apiClient);
  bool _isLoading = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await _authService.loadToken();
    final admin = await _authService.me();
    setState(() {
      _isLoggedIn = admin != null;
      _isLoading = false;
    });
  }

  void _setLoggedIn(bool value) {
    setState(() => _isLoggedIn = value);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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
                  authService: _authService,
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
