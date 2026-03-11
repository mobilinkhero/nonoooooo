# Chatvoo Flutter App

A premium Flutter mobile app for the **Chatvoo WhatsApp Marketing Platform**.

## 🏗️ Architecture

```
lib/
├── core/
│   ├── constants/     # API endpoints
│   ├── network/       # Dio HTTP client w/ cookie auth
│   └── theme/         # App design system (colors, typography)
├── features/
│   ├── auth/          # Login screen + auth service
│   ├── home/          # Dashboard (stats, KPIs)
│   ├── inbox/         # Conversation list + chat screen
│   ├── campaigns/     # Campaign list + creation
│   ├── contacts/      # Contact directory
│   └── more/          # Profile, settings, logout
└── shared/
    ├── providers/     # Riverpod state (auth, etc.)
    └── widgets/       # Reusable UI (StatCard, SectionHeader)
```

## 🚀 Running the App

1. Ensure [Flutter](https://docs.flutter.dev/get-started/install) is installed
2. Update `lib/core/constants/api_constants.dart` with your server URL:
   ```dart
   static const String baseUrl = 'https://your-server.com';
   ```
3. Run:
   ```sh
   cd chatvoo_app
   flutter pub get
   flutter run
   ```

## 🎨 Design System

The app follows the same design language as the Chatvoo web platform:
- **Primary**: `#25C665` (WhatsApp green)
- **Font**: Inter
- **Background**: `#F8FAFC` (off-white)
- **Cards**: White with `#E2E8F0` border
- **Radius**: 14–20px throughout

## 📱 Screens

| Screen | Description |
|---|---|
| **Login** | Email/password with animations and validation |
| **Dashboard** | Channel status, KPI grid, delivery rates |
| **Inbox** | Conversation list with unread badges |
| **Chat** | WhatsApp-style bubble chat with send |
| **Campaigns** | Tabbed list with live stats + progress |
| **Contacts** | Searchable contact directory |
| **More** | Profile, settings, tools menu, logout |

## 🔌 API

Uses cookie-based session auth (same as web). Cookies are persisted securely via `cookie_jar` + `flutter_secure_storage`.
