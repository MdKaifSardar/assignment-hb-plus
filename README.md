# HB+ Fit Workspace — Cross-Platform Client

**Live deployment:** https://hbplus-workspace-kaif.netlify.app

A React Native app that runs on web, iOS and Android from one codebase. Users sign in with Google and only `@hbplus.fit` accounts get through.

Access is restricted exclusively to authorized organization accounts (**`@hbplus.fit`**). Any attempts to authenticate with personal or unauthorized domains (e.g., `@gmail.com`) are immediately terminated, sessions are revoked, and access is denied.

---

## Architecture & Authentication Flow

```
                      +-----------------------------+
                      |       User Initiates        |
                      |   "Continue with Google"    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Google OAuth 2.0       |
                      |    Handshake / Consent      |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Domain Validation Gate   |
                      |   extractDomain(email)      |
                      +--------------+--------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
    [Domain === "hbplus.fit"]               [Domain !== "hbplus.fit"]
                 |                                       |
                 v                                       v
   +---------------------------+           +---------------------------+
   |   1. Store Secure Session |           |   1. Revoke OAuth Token   |
   |   2. Resolve Role (Admin) |           |   2. Purge Local Storage  |
   |   3. Log Allowed in Audit |           |   3. Log Blocked in Audit |
   |   4. Mount Dashboard      |           |   4. Show Exact Alert:    |
   +---------------------------+           |      "Access restricted.  |
                                           |      Please login using   |
                                           |      your official domain |
                                           |      email."              |
                                           +---------------------------+
```

---

## Key Features

- **Cross-Platform**: Runs natively on Web browsers (desktop & mobile responsive), iOS, and Android using React Native for Web and Expo SDK 58.
- **Strict Domain Whitelisting**:
  - Validates exact domain matching (`@hbplus.fit`).
  - Blocks subdomain tricks and look-alike domains (`hbplus.fit.evil.com`).
  - Instantly revokes session tokens and displays:
    > *"Access restricted. Please login using your official domain email."*
- **UI**:
  - Responsive login and dashboard screens with a Google-style sign-in button.
  - Domain badge and session details on the dashboard.
- **Role-Based Access Control (Bonus)**:
  - Supports `admin` and `user` roles.
  - Dedicated Admin Console with live user directory, role assignment, domain policy inspector, and security audit log.
- **Route Protection**:
  - `RootNavigator` renders the dashboard only when a valid `@hbplus.fit` session exists. Any URL on the deployed site falls through to the login screen otherwise.
- **Netlify**: static export with a catch-all rewrite to `index.html` in `netlify.toml`.

---

## Directory Structure

```text
├── assets/                  # Icons and brand assets
├── src/
│   ├── components/          # UI primitives (GoogleSignInButton, Badge, AlertBanner)
│   ├── constants/           # App config and theme tokens
│   ├── context/             # AuthContext and state management
│   ├── hooks/               # useResponsive
│   ├── navigation/          # RootNavigator and route guards
│   ├── screens/             # LoginScreen, DashboardScreen, AdminScreen
│   ├── services/            # Supabase client, storage, audit logs, user directory
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Canonical domain validator and platform helpers
├── App.tsx                  # Application entry point
├── app.json                 # Expo configuration
├── netlify.toml             # Netlify build configuration
├── package.json             # Dependencies and build scripts
└── tsconfig.json            # TypeScript configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or later, recommended v20+)
- npm or yarn

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/MdKaifSardar/assignment-hb-plus.git
cd assignment-hb-plus

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration:
```env
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
EXPO_PUBLIC_ADMIN_EMAILS=admin@hbplus.fit,kaif@hbplus.fit
```

Live Supabase & Google OAuth Configuration:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xzevqnakiesnfqswehic.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Running Locally

#### Run on Web (Browser):
```bash
npm run web
```
The application will open in your browser at `http://localhost:8081` (or next available port).

#### Run on Mobile:
```bash
npm start
```
Scan the terminal QR code with **Expo Go** on your iOS or Android device.

---

## Evaluation Sandbox (Reviewer Quick-Test)

For evaluation and testing without needing a corporate Google Workspace account, the Login Screen includes a built-in **Evaluation Sandbox**:

1. Click **"Open Quick-Test Presets"** on the login screen.
2. Click **"Test Authorized Account (kaif@hbplus.fit)"** → Successfully signs in, navigates to the Protected Dashboard, and displays the verified green domain badge.
3. Click **"Test Disallowed Personal (user@gmail.com)"** → Session is immediately revoked, local storage is purged, and the exact required alert is displayed:
   > *"Access restricted. Please login using your official domain email."*
4. Click **"Test Administrator Account (admin@hbplus.fit)"** → Unlocks the **Admin Console** tab with real-time audit logs and user directory.

---

## Deployment to Netlify

To generate the static web production build:

```bash
npm run build:web
```

The compiled single-page web bundle is placed in `dist/`. `netlify.toml` handles routing rewrites (`/* /index.html 200`) automatically.

Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_ALLOWED_DOMAIN` and `EXPO_PUBLIC_ADMIN_EMAILS` in the Netlify site environment before building; Expo inlines them at build time.

---

## Database Setup

Run `supabase_schema.sql` in the Supabase SQL Editor. It creates `user_profiles` and `audit_logs`, enables row level security and seeds the directory. Both services fall back to an in-memory store if the tables are unreachable.

In Supabase, add the deployed URL and `hbplus://auth-callback` under Authentication → URL Configuration → Redirect URLs, and enable the Google provider with your OAuth client credentials.

### Known limitation

The RLS policies allow the anon key to read and write both tables, because the client talks to Supabase directly. Domain restriction is enforced in the client, so a hardened deployment should move role changes and audit writes behind policies keyed on the authenticated JWT or a server function.
