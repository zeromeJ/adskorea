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

## Firebase push notifications

1. Create an Android app in Firebase with package name
   `com.example.ads_inquiry_admin`.
2. Download `google-services.json` and place it at
   `android/app/google-services.json`.
3. Create a Firebase service account key and set its complete JSON as the
   backend `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable.
4. Apply the Prisma migration and deploy the backend before opening the app.

The app registers its FCM token after a successful admin login. Tapping a new
inquiry notification opens the matching inquiry detail screen.
