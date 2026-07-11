# ADS Inquiry Management Setup

## Backend

1. Install packages.

```bash
npm install
```

2. Copy environment variables.

```bash
cp .env.example .env.local
```

3. Set a real PostgreSQL `DATABASE_URL` in `.env.local`.

4. Generate Prisma Client.

```bash
npx prisma generate
```

5. Apply database migration.

```bash
npx prisma migrate dev --name init
```

6. Create the initial admin account.

```bash
npx prisma db seed
```

Initial development login:

- ID: `admin`
- PW: `1234`

Change the default admin password before production.

7. Run the website/backend.

```bash
npm run dev
```

## Admin APIs

- `POST /api/admin/login`
- `GET /api/admin/me`
- `POST /api/admin/logout`
- `GET /api/admin/inquiries`
- `GET /api/admin/inquiries/[id]`
- `PATCH /api/admin/inquiries/[id]`

Admin inquiry APIs require:

```http
Authorization: Bearer {token}
```

## Flutter Android App

The app source is in `admin_app/`.

1. Install Flutter on macOS.
2. Set the backend URL in `admin_app/lib/constants/api.dart`.

For Android emulator local testing:

```dart
static const apiBaseUrl = 'http://10.0.2.2:3000';
```

For a real Android device on local network:

```dart
static const apiBaseUrl = 'http://192.168.x.x:3000';
```

For production, replace it with the deployed website domain.

3. Install Flutter packages.

```bash
cd admin_app
flutter pub get
```

4. Run Android app.

```bash
flutter run
```

5. Build APK.

```bash
flutter build apk --release
```

The generated APK can be installed on the administrator's Android phone.
