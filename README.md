# Umeed Project

Umeed is a campus/community support platform with three parts in this repository:

- **`backend/`** – Node.js + Express REST API (MongoDB/Mongoose, JWT auth)
- **`UmeedUserApp/`** – React Native (CLI) mobile app for users
- **`UmeedAdminApp/`** – React Native (CLI) mobile app for administrators

> **Security:** Do not commit secrets. `.env` files, keystores, signing properties, service-account keys, and credentials must never be hardcoded or pushed. Use environment variables and local ignored config files.

---

## Repository structure

| Path | Description |
|------|-------------|
| `backend/` | Express API server, Mongoose models, routes, controllers, middleware, scripts |
| `backend/DEPLOY.md` | Backend deployment guide (Render + MongoDB Atlas, env vars, uploads note) |
| `backend/scripts/createAdmin.js` | Script to create/promote an admin user (no hardcoded password) |
| `UmeedUserApp/` | User-facing React Native app (Android/iOS project files included) |
| `UmeedAdminApp/` | Admin React Native app (separate app id, can install alongside user app) |
| `All Screens of User Side/` | UI/screen reference images |
| `release/` | APK files tracked in this repo (see [APK files](#apk-files)) |

---

## Prerequisites

- **Node.js** (backend: `>=20` per `backend/package.json`)
- **npm**
- **MongoDB** (local or MongoDB Atlas) for `MONGO_URI`
- **React Native CLI environment** for mobile apps: JDK, Android SDK/emulator or device (and Xcode/CocoaPods for iOS) — see [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment)

---

## Backend (`backend/`)

### Tech & behavior
- Entry: `server.js` (CommonJS). Listens on `process.env.PORT || 5000`.
- Database: MongoDB via Mongoose (`config/db.js`, `MONGO_URI`).
- Auth: JWT (`JWT_SECRET`).
- Health checks: `GET /health` and `GET /api/health` → `{ "status": "ok" }` (also `GET /` returns API status JSON).
- Uploads: stored on local disk `backend/uploads/` and served at `/uploads` (ephemeral on hosts like Render — see `backend/DEPLOY.md` for Cloudinary/S3 recommendation).
- CORS: configurable via optional `CORS_ORIGIN` (comma-separated); defaults to permissive if unset.

### Environment variables
Create `backend/.env` locally (**never commit**). See `backend/.env.example` for variable names (set your own values):

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (platforms like Render inject this) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `CORS_ORIGIN` | Optional comma-separated allowed origins |

### Install & run
```bash
cd backend
npm install
npm start        # production-style: node server.js
# or
npm run dev      # nodemon server.js
```

---

## Admin account (email & password)

**There is no default or hardcoded admin email/password in this repository.** You must create/set admin credentials yourself for the database your backend uses.

### Create or promote an admin user
Use `backend/scripts/createAdmin.js`. It reads `MONGO_URI` from `backend/.env` (via dotenv) or the environment, hashes the password, and creates the user or updates/promotes an existing user to `role: admin`, `status: active`.

Run from the **repo root**:

**Windows PowerShell**
```powershell
$env:ADMIN_EMAIL="your-admin-email@example.com"
$env:ADMIN_PASSWORD="YourStrongPasswordHere"
$env:ADMIN_NAME="Umeed Admin"
$env:ADMIN_PHONE="03000000000"
node backend/scripts/createAdmin.js
```

**macOS/Linux**
```bash
ADMIN_EMAIL="your-admin-email@example.com" \
ADMIN_PASSWORD="YourStrongPasswordHere" \
ADMIN_NAME="Umeed Admin" \
ADMIN_PHONE="03000000000" \
node backend/scripts/createAdmin.js
```

**CLI arguments**
```bash
node backend/scripts/createAdmin.js --email your-admin-email@example.com --password YourStrongPasswordHere --name "Umeed Admin" --phone 03000000000
```

Notes:
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or `--email`/`--password`) are required; password must be at least 6 characters.
- Choose your own secure **admin email** and **admin password** and keep them private (do not commit).
- For production, run this against the **same `MONGO_URI` database** used by your deployed backend.

### Admin login
- API endpoint: `POST /api/auth/admin/login` (and related auth routes in backend).
- **UmeedAdminApp**: log in with the **admin email and password you set** above (for the DB/API the app is connected to). Non-admin accounts are rejected with a clear message.
- If you forget the password, run `createAdmin.js` again for the same email to set a new password (and ensure role/status are admin/active).

---

## Mobile apps

### UmeedUserApp (`UmeedUserApp/`)
- React Native 0.88.x, React Navigation, Axios API client.
- Android application id: `com.umeeduserapp`.

```bash
cd UmeedUserApp
npm install
npm start          # Metro
npm run android    # in another terminal
```

### UmeedAdminApp (`UmeedAdminApp/`)
- React Native 0.88.x, React Navigation (stack + bottom tabs), Axios API client.
- Android application id/namespace: `com.umeed.admin`, display name **Umeed Admin** (installable alongside user app).
- Metro configured on port **8081** (`npm start`).

```bash
cd UmeedAdminApp
npm install
npm start          # react-native start --port 8081
npm run android    # in another terminal (match port if needed)
```

### API base URL configuration
Each app has a single API client config with debug/release switching:
- `UmeedUserApp/src/api/client.js`
- `UmeedAdminApp/src/api/client.js` (and `UmeedAdminApp/src/services/api.js` kept in sync)

Behavior:
- **Debug (`__DEV__`)**: local backend — Android emulator `http://10.0.2.2:5000/api` (requires backend on port 5000 and `adb reverse tcp:5000 tcp:5000`).
- **Release**: `PROD_BASE_URL` placeholder `https://REPLACE_WITH_DEPLOYED_BACKEND_URL/api` — replace with your deployed HTTPS API base URL (e.g. `https://<your-service>.onrender.com/api`) and rebuild release APKs.

Android cleartext is allowed for debug and disabled for release builds (HTTPS-only in release).

---

## APK files

| File | Path in repo | App | Build type | Notes |
|------|---------------|-----|------------|------|
| `Umeed-User-debug.apk` | [`release/Umeed-User-debug.apk`](release/Umeed-User-debug.apk) | UmeedUserApp | Debug | User app debug APK. Debug builds use local backend config (`10.0.2.2:5000` on Android emulator with `adb reverse`). |

**Not currently in repo (not available/built yet):**
- User app release APK (`Umeed-User.apk`)
- Admin app debug/release APK (`Umeed-Admin-debug.apk` / `Umeed-Admin.apk`)

Typical local build output locations:
- `UmeedUserApp/android/app/build/outputs/apk/debug/app-debug.apk`
- `UmeedUserApp/android/app/build/outputs/apk/release/app-release.apk`
- `UmeedAdminApp/android/app/build/outputs/apk/debug/app-debug.apk`
- `UmeedAdminApp/android/app/build/outputs/apk/release/app-release.apk`

After building, copy APKs into `release/` and commit/push (or upload via GitHub Releases).

---

## Deployment

- Backend deployment: see **[`backend/DEPLOY.md`](backend/DEPLOY.md)** (MongoDB Atlas, Render Web Service, environment variables, `GET /health` verification, admin seeding against production DB, upload persistence note).
- After deploying backend, set `PROD_BASE_URL` in both app API client configs to `https://<your-service>/api` and rebuild release APKs.

---

## Git & security notes

- `.gitignore` files exclude `.env`, keystores, signing secrets, build outputs, `node_modules`, uploads, logs, etc.
- `.env.example` files contain variable names only (no values).
- Never commit real `MONGO_URI`, `JWT_SECRET`, admin passwords, keystore passwords, or service-account credentials.
- Verify with `git status` before committing to ensure no secrets or signing files are staged.
