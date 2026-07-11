import 'package:flutter/foundation.dart';

class ApiConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        kReleaseMode ? 'https://www.adskorea.co.kr' : 'http://10.0.2.2:3000',
  );
}
