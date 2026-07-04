# Sarkar Packers & Movers — Backend API

Production-ready REST API built with Node.js, Express.js, TypeScript, and MongoDB Atlas.

## Quick Start

```bash
cd backend
cp .env.example .env      # fill in your values
npm install
npm run dev               # http://localhost:5000
```

## API Docs

Swagger UI available at: `http://localhost:5000/api/docs`

## Environment Variables

Copy `.env.example` to `.env` and fill all required values.

## Docker

```bash
docker-compose up --build
```

## Credentials (Demo)

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@sarkarpackers.in      | Admin@123  |
| User  | user@example.com            | User@123   |

> **Create the admin** by inserting directly into MongoDB:
> ```js
> db.admins.insertOne({ name: "Admin", email: "admin@sarkarpackers.in", password: "<bcrypt hash>", role: "admin" })
> ```
> Or run a seed script after `npm run dev`.

## API Routes

| Method | Route                             | Auth    | Description               |
|--------|-----------------------------------|---------|---------------------------|
| POST   | /api/auth/register                | Public  | User registration         |
| POST   | /api/auth/login                   | Public  | User login                |
| POST   | /api/auth/refresh-token           | Public  | Rotate refresh token      |
| POST   | /api/auth/logout                  | Public  | Logout                    |
| POST   | /api/auth/send-email-otp          | Public  | Send email OTP            |
| POST   | /api/auth/verify-email-otp        | Public  | Verify email OTP          |
| POST   | /api/auth/send-mobile-otp         | Public  | Send mobile OTP           |
| POST   | /api/auth/verify-mobile-otp       | Public  | Verify mobile OTP         |
| POST   | /api/auth/forgot-password         | Public  | Send reset link           |
| POST   | /api/auth/reset-password          | Public  | Reset password            |
| GET    | /api/auth/google                  | Public  | Google OAuth              |
| GET    | /api/users/profile                | User    | Get profile               |
| PUT    | /api/users/profile                | User    | Update profile            |
| PUT    | /api/users/change-password        | User    | Change password           |
| POST   | /api/users/upload-avatar          | User    | Upload avatar             |
| POST   | /api/leads                        | Public  | Submit quote request      |
| POST   | /api/contact                      | Public  | Contact form              |
| GET    | /api/blogs                        | Public  | List published blogs      |
| GET    | /api/blogs/:slug                  | Public  | Get blog by slug          |
| GET    | /api/testimonials                 | Public  | Get testimonials          |
| POST   | /api/admin/login                  | Public  | Admin login               |
| GET    | /api/admin/dashboard              | Admin   | Dashboard stats           |
| GET    | /api/admin/leads                  | Admin   | All leads                 |
| PUT    | /api/admin/leads/:id              | Admin   | Update lead status        |
| DELETE | /api/admin/leads/:id              | Admin   | Delete lead               |
| GET    | /api/admin/blogs                  | Admin   | All blogs                 |
| POST   | /api/admin/blogs                  | Admin   | Create blog               |
| PUT    | /api/admin/blogs/:id              | Admin   | Update blog               |
| DELETE | /api/admin/blogs/:id              | Admin   | Delete blog               |
| POST   | /api/admin/testimonials           | Admin   | Create testimonial        |
| PUT    | /api/admin/testimonials/:id       | Admin   | Update testimonial        |
| DELETE | /api/admin/testimonials/:id       | Admin   | Delete testimonial        |
| GET    | /api/admin/contacts               | Admin   | View contact submissions  |

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: MongoDB Atlas + Mongoose 8
- **Auth**: JWT (access + refresh tokens) + Google OAuth
- **OTP**: Email (Nodemailer/Brevo) + SMS (Twilio)
- **Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize, bcryptjs
- **Docs**: Swagger/OpenAPI
- **Deployment**: Docker, Docker Compose, Render/Railway ready
