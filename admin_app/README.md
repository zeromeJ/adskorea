# ADS 문의관리 Flutter App

Flutter SDK is required to run or build the Android APK.

This folder contains the Dart source, `pubspec.yaml`, services, models, and screens for the admin app.

If Flutter is installed and native Android project files are missing, run:

```bash
flutter create .
flutter pub get
flutter run
```

Before testing, update `lib/constants/api.dart`.

Android emulator local backend:

```dart
static const apiBaseUrl = 'http://10.0.2.2:3000';
```

Production:

```dart
static const apiBaseUrl = 'https://your-domain.com';
```

Build APK:

```bash
flutter build apk --release
```

Initial login:

- ID: `admin`
- PW: `1234`

Change the default admin password before production.
