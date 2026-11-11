# Umeed Backend Deployment Guide

## Backend overview
- **Framework:** Node.js + Express (`server.js`, CommonJS)
- **Database:** **MongoDB** via Mongoose (`mongoose`, models in `backend/models/`, connection in `backend/config/db.js` using `MONGO_URI`)
- **Auth:** JWT (`JWT_SECRET`)
- **Uploads:** Local disk storage in `backend/uploads/` via Multer, served at `/uploads` (images for complaints, welfare, profile, impact stories, etc.)
- **Health:** `GET /health` and `GET /api/health` return `{ "status": "ok" }`
- **Port:** listens on `process.env.PORT || 5000`

## Environment variables (names only — set values in hosting dashboard, never commit)
| Variable | Purpose |
|---|---|
| `PORT` | Server port (hosting platforms usually inject this automatically) |
| `MONGO_URI` | MongoDB connection string (Atlas or other MongoDB) |
| `JWT_SECRET` | Secret used to sign/verify JWT tokens (use a long random value) |
| `CORS_ORIGIN` | *(Optional)* Comma-separated allowed origins; leave unset to allow all origins |

See `backend/.env.example`. **Never commit `.env` or secrets.**

## Important: local uploads are ephemeral on most hosts
Uploaded files are saved to `backend/uploads/` on local disk. On platforms like **Render** (and other container/ephemeral filesystems), the filesystem is reset on restart/redeploy, so **uploaded images will be deleted**. Database records will still reference `/uploads/...` URLs that no longer exist.

**Recommended fix (production):** store uploads in object storage (e.g. **Cloudinary**, AWS S3, or similar) instead of local disk.
- Suggested approach: add Cloudinary (or S3) SDK, upload files there in `middleware/upload.js`/upload handlers, store the returned secure URL in the database, and remove/avoid relying on local `/uploads` serving for new uploads.
- This requires code changes and provider credentials (API key/secret) — do it before relying on production uploads. Until then, treat uploads as non-durable on Render.

## Deploy to MongoDB Atlas (if using Atlas)
1. Create/sign in at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a **Project** and a **Cluster** (free/shared tier is fine for testing).
3. **Database Access:** create a database user with a strong password (save it securely).
4. **Network Access:** allow access from your hosting platform (for Render, you may need to allow `0.0.0.0/0` or follow Render/Atlas guidance; restrict where possible).
5. **Connect:** choose "Drivers" → copy the connection string (e.g. `mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority). Replace `<user>`, `<password>`, and `<dbname>`.
6. Set this value as `MONGO_URI` in your Render service environment variables (do not commit it).

## Deploy to Render (Web Service)
1. Push this repo to GitHub (see root push instructions).
2. Sign in at [Render](https://render.com) and create a **New + → Web Service**.
3. Connect the GitHub repo `daniyalniaztanoli/Umeed_Project`.
4. Configure:
   - **Name:** e.g. `umeed-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** as needed (free tier sleeps on inactivity)
5. **Environment Variables** (Render dashboard → Environment): add
   - `MONGO_URI` = your Atlas/production MongoDB URI
   - `JWT_SECRET` = a long random secret
   - `CORS_ORIGIN` = *(optional)* comma-separated allowed origins
   - `PORT` is provided by Render automatically (server already uses `process.env.PORT`)
6. Deploy. Verify: open `https://<your-service>.onrender.com/health` → should return `{ "status": "ok" }`.
7. Note the deployed base URL (e.g. `https://<your-service>.onrender.com`). API base for mobile apps is `https://<your-service>.onrender.com/api`.

## Create the first admin in production database
After `MONGO_URI` points to your production DB (and is available in `backend/.env` locally pointing to prod, or set in the environment where you run the script), run from the workspace root:

```bash
# macOS/Linux
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="YourStrongPass123" ADMIN_NAME="Umeed Admin" ADMIN_PHONE="03000000000" node backend/scripts/createAdmin.js

# Windows PowerShell
$env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="YourStrongPass123"; $env:ADMIN_NAME="Umeed Admin"; $env:ADMIN_PHONE="03000000000"; node backend/scripts/createAdmin.js
```
- Replace email/password/name/phone with your values (**never hardcode or commit passwords**).
- Requires network access to the production `MONGO_URI`. The script creates the admin or promotes/updates an existing user to `role: admin`, `status: active`.
- You can also run the equivalent with CLI args: `node backend/scripts/createAdmin.js --email ... --password ... --name ... --phone ...`

## After deploy: update mobile apps
1. Set the production API URL in `UmeedUserApp/src/api/client.js` and `UmeedAdminApp/src/api/client.js` (`PROD_BASE_URL = 'https://<your-service>.onrender.com/api'`).
2. Rebuild release APKs (see release steps). Release builds use the production HTTPS URL and block cleartext HTTP.

