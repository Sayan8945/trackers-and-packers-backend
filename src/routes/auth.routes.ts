import { Router } from "express";
import passport from "passport";
import * as auth from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import {
  RegisterSchema, LoginSchema, ForgotPasswordSchema,
  FirebaseLoginSchema,
} from "../validators/auth.schema";

const router = Router();

/* ── Email / Password auth ──────────────────────────────── */
router.post("/register",       validate(RegisterSchema),       auth.register);
router.post("/login",          validate(LoginSchema),          auth.login);
router.post("/refresh-token",                                  auth.refreshToken);
router.post("/logout",                                         auth.logout);

/* ── Firebase Phone auth ─────────────────────────────────── */
router.post("/firebase-login", validate(FirebaseLoginSchema),  auth.firebaseLogin);

/* ── Password reset ──────────────────────────────────────── */
router.post("/forgot-password",validate(ForgotPasswordSchema), auth.forgotPassword);
router.post("/reset-password",                                 auth.resetPassword);

/* ── Google OAuth ────────────────────────────────────────── */
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  auth.googleCallback
);

export default router;
