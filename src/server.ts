import app from "./app";
import { connectDB } from "./config/database";
import { initCloudinary } from "./config/cloudinary";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT ?? 5000);

const start = async () => {
  try {
    await connectDB();
    initCloudinary();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📖 API docs: http://localhost:${PORT}/api/docs`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Graceful shutdown...`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
    process.on("uncaughtException",  (err) => { logger.error("Uncaught exception", { err }); process.exit(1); });
    process.on("unhandledRejection", (err) => { logger.error("Unhandled rejection", { err }); process.exit(1); });

  } catch (err) {
    logger.error("Failed to start server", { err });
    process.exit(1);
  }
};

start();
