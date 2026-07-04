# Sarkar Packers & Movers — Backend API

REST API for **Sarkar Packers and Movers Pvt. Ltd.** Built with Express, TypeScript, MongoDB, and Firebase Admin SDK.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 4 |
| Language | TypeScript 5.7 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (access + refresh tokens) + Firebase Admin SDK + Passport Google OAuth |
| Email | Nodemailer (Brevo / any SMTP) |
| File uploads | Multer → Cloudinary |
| Validation | Zod |
| Logging | Winston |
| API Docs | Swagger UI (`/api/docs`) |
| Security | Helmet, CORS, rate-limit, mongo-sanitize, xss-clean |
| Container | Docker + docker-compose |

---

## Project Structure

```
src/
├── app.ts                 # Express app — middleware, routes
├── server.ts              # Entry point — DB connect, listen
├── config/
│   ├── database.ts        # MongoDB Atlas connection
│   ├── firebase.ts        # Firebase Admin SDK init + token verifier
│   ├── cloudinary.ts      # Cloudinary init
│   ├── passport.ts        # Google OAuth strategy
│   └── swagger.ts         # Swagger spec + UI setup
├── controllers/
│   ├── auth.controller.ts      # register, login, firebase-login, OAuth…
│   ├── admin.controller.ts     # Admin login, dashboard stats
│   ├── user.controller.ts      # Profile, password, avatar
│   ├── lead.controller.ts      # Quote requests (CRUD)
│   ├── blog.controller.ts      # Blog posts (CRUD)
│   ├── testimonial.controller.ts
│   └── contact.controller.ts
├── middleware/
│   ├── auth.middleware.ts  # JWT verification (user + admin)
│   ├── validate.middleware.ts  # Zod schema validation
│   ├── upload.middleware.ts    # Multer memory storage
│   └── error.middleware.ts     # Global error + 404 handler
├── models/                # Mongoose schemas
│   ├── User.ts            # email, mobile, password, firebaseUid, provider…
│   ├── Admin.ts
│   ├── Lead.ts
│   ├── Blog.ts
│   ├── Testimonial.ts
│   ├── Contact.ts
│   ├── OTP.ts             # TTL-indexed OTP store (password reset)
│   └── RefreshToken.ts    # TTL-indexed refresh token store
├── routes/                # Express routers
├── services/
│   ├── token.service.ts   # JWT pair generation + rotation
│   ├── email.service.ts   # Nodemailer templates (OTP, reset, contact)
│   ├── otp.service.ts     # OTP creation + verification (email only)
│   └── cloudinary.service.ts
├── utils/
│   ├── ApiError.ts        # Typed operational error class
│   ├── ApiResponse.ts     # Consistent JSON response helpers
│   ├── jwt.ts             # sign / verify access + refresh tokens
│   ├── generateOtp.ts     # Cryptographically random 6-digit OTP
│   └── logger.ts          # Winston logger
├── validators/            # Zod request schemas
└── types/
    └── express.d.ts       # Augments req.jwtUser
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?appName=<app>

# Frontend URL (CORS + OAuth redirect)
CLIENT_URL=http://localhost:3000

# JWT
JWT_ACCESS_SECRET=your-strong-access-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# SMTP — Brevo, Gmail, or any SMTP provider
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-smtp-password
SMTP_FROM="Sarkar Packers <noreply@sarkarpackers.in>"

# Firebase Admin SDK — Project Settings → Service accounts → Generate new private key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary — cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Run the dev server

```bash
npm run dev
# → http://localhost:5000
# → API docs: http://localhost:5000/api/docs
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run compiled production build |
| `npm run lint` | Run ESLint on `src/` |
| `npm run type-check` | TypeScript check without emit |

---

## API Reference

Full interactive docs available at **`/api/docs`** (Swagger UI) when the server is running.

### Auth routes — `POST /api/auth/...`

| Endpoint | Auth | Description |
|---|---|---|
| `/register` | Public | Create account — auto-logs user in |
| `/login` | Public | Email or mobile + password login |
| `/firebase-login` | Public | Exchange Firebase ID token for JWT |
| `/refresh-token` | Cookie | Rotate refresh token, return new access token |
| `/logout` | Cookie | Revoke refresh token |
| `/forgot-password` | Public | Send password reset OTP to email |
| `/reset-password` | Public | Verify OTP and set new password |
| `/google` | Public | Start Google OAuth flow |
| `/google/callback` | OAuth | Google OAuth callback → redirect with tokens |

### User routes — `/api/users/...` *(JWT required)*

| Endpoint | Method | Description |
|---|---|---|
| `/profile` | GET | Get current user profile |
| `/profile` | PUT | Update name / mobile |
| `/change-password` | PUT | Change password |
| `/upload-avatar` | POST | Upload avatar image to Cloudinary |

### Admin routes — `/api/admin/...`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/login` | POST | Public | Admin login |
| `/dashboard` | GET | Admin JWT | Stats overview |
| `/leads` | GET/PUT/DELETE | Admin JWT | Lead management |
| `/blogs` | GET/POST/PUT/DELETE | Admin JWT | Blog management |
| `/testimonials` | POST/PUT/DELETE | Admin JWT | Testimonial management |
| `/contacts` | GET | Admin JWT | Contact form submissions |

### Public routes

| Endpoint | Description |
|---|---|
| `GET /api/leads` | Submit quote request |
| `GET /api/blogs` | Paginated published blogs |
| `GET /api/blogs/:slug` | Single blog by slug |
| `GET /api/testimonials` | Published testimonials |
| `POST /api/contact` | Submit contact form |
| `GET /health` | Server health check |

---

## Authentication Architecture

```
Client → sends Firebase ID token (phone auth)
       ↓
POST /api/auth/firebase-login
       ↓
Firebase Admin SDK verifyIdToken()
       ↓
Find or create User in MongoDB
       ↓
generateTokenPair() → access token (15m) + refresh token (30d)
       ↓
Refresh token persisted to DB (auto-expires via TTL index)
Refresh token set as httpOnly cookie
Access token returned in response body
```

JWT payload: `{ id: string, role: "user" | "admin" }`

---

## Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Standalone
docker build -t sarkar-packers-api .
docker run -p 5000:5000 --env-file .env sarkar-packers-api
```

---

## MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Database Access** → create a user with read/write permissions
3. **Network Access** → add your server IP (or `0.0.0.0/0` for dev)
4. Copy the connection string into `MONGODB_URI` in `.env`

---

## Firebase Admin Setup

1. [console.firebase.google.com](https://console.firebase.google.com) → your project
2. **Project Settings → Service accounts → Generate new private key**
3. Copy `project_id`, `client_email`, and `private_key` into `.env`
4. The `FIREBASE_PRIVATE_KEY` must keep the `\n` newlines — wrap the entire value in double quotes
