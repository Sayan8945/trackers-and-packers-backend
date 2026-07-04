import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import passport from "passport";

import { initPassport } from "./config/passport";
import { initFirebaseAdmin } from "./config/firebase";
import { setupSwagger } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";

import authRoutes        from "./routes/auth.routes";
import userRoutes        from "./routes/user.routes";
import adminRoutes       from "./routes/admin.routes";
import leadRoutes        from "./routes/lead.routes";
import blogRoutes        from "./routes/blog.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import contactRoutes     from "./routes/contact.routes";

const app = express();

/* ── Trust Railway / Vercel reverse proxy ───────────────── */
// Required so rate-limiter sees real client IPs and secure cookies work correctly
app.set("trust proxy", 1);

/* ── Security headers ───────────────────────────────────── */
app.use(helmet());

/* ── CORS ───────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.CLIENT_URL ?? "http://localhost:3000",
  "http://localhost:3001",
  "https://sarkar-packers-movers.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / Postman (no origin) in non-production
    if (!origin && process.env.NODE_ENV !== "production") return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

/* ── Rate limiting ──────────────────────────────────────── */
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: "Too many requests, please try again later." },
}));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Rate limit exceeded." },
}));

/* ── Body parsing ───────────────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ── Sanitization ───────────────────────────────────────── */
app.use(mongoSanitize());

/* ── Logging ────────────────────────────────────────────── */
app.use(morgan("combined", {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: () => process.env.NODE_ENV === "test",
}));

/* ── Passport ───────────────────────────────────────────── */
initPassport();
app.use(passport.initialize());

/* ── Firebase Admin ─────────────────────────────────────── */
initFirebaseAdmin();

/* ── Health check ───────────────────────────────────────── */
app.get("/health", (_req, res) => res.json({ success: true, status: "ok", timestamp: new Date() }));

/* ── API routes ─────────────────────────────────────────── */
app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/leads",        leadRoutes);
app.use("/api/blogs",        blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/contact",      contactRoutes);

/* ── Swagger docs ───────────────────────────────────────── */
setupSwagger(app);

/* ── 404 & error handlers ───────────────────────────────── */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
