import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import { logger } from "../utils/logger";

export const initPassport = (): void => {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    logger.warn(
      "Google OAuth credentials not set (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) — " +
      "Google login will be unavailable until they are provided."
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google"), false);

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (!user) {
            user = await User.create({
              name:            profile.displayName,
              email,
              googleId:        profile.id,
              avatar:          profile.photos?.[0]?.value,
              isEmailVerified: true,
              password:        undefined,
            });
            logger.info(`New Google user registered: ${email}`);
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }

          return done(null, user as unknown as Express.User);
        } catch (err) {
          return done(err as Error, false);
        }
      }
    )
  );

  logger.info("Google OAuth strategy registered");
};
