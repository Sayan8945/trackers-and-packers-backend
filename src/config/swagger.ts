import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sarkar Packers & Movers API",
      version: "1.0.0",
      description: "Production REST API for Sarkar Packers and Movers Pvt. Ltd.",
      contact: { name: "Sarkar Packers", email: "ranadips12@gmail.com" },
    },
    servers: [
      { url: "http://localhost:5000", description: "Development" },
      { url: "https://api.sarkarpackers.in", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Sarkar Packers API Docs",
  }));
  app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
};
