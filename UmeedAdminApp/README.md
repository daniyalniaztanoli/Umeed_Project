# Umeed Admin (React Native)

React Native CLI admin application for managing the Umeed platform (complaints, welfare, donations, and content) against the existing Express backend.

## Stack
- React Native 0.88.1 / React 19.3.0 (matched with `UmeedUserApp`)
- React Navigation (native stack + bottom tabs)
- Axios API client with token auth

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Metro:
   ```bash
   npm start
   ```
3. Run Android:
   ```bash
   npm run android
   ```

## Backend
- API base URL: configured in `src/api/client.js` (`BASE_URL`).
- Login: admin/staff/finance officer accounts via `POST /api/auth/login`.
- The app uses existing backend routes for complaints, welfare, donations, announcements, events, resources, impact stories, volunteers, blood donors, feedback, users, staff, departments, and notifications.

## Notes
- Android package/app id: `com.umeedadminapp`, display name: **Umeed Admin**.
- iOS template files were copied from `UmeedUserApp` for parity; rename bundle identifiers/schemes in Xcode if building for iOS release.
- This project is separate from `UmeedUserApp` and does not modify it.
