import winston from "winston";

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level}]: ${message}${extra}`;
});

const isProduction = process.env.NODE_ENV === "production";

// File transports are only added in non-production environments.
// In production (Railway, Docker, etc.) logs go to stdout/stderr only —
// no filesystem writes needed, and containers often run as non-root without
// write access to the working directory.
const fileTransports: winston.transport[] = isProduction
  ? []
  : [
      new winston.transports.File({ filename: "logs/error.log", level: "error" }),
      new winston.transports.File({ filename: "logs/combined.log" }),
    ];

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" })),
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: "HH:mm:ss" }), devFormat),
    }),
    ...fileTransports,
  ],
});
