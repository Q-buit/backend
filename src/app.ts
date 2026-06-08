import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAdminRoutes } from "./routes/admin-routes.js";
import { registerHealthRoutes } from "./routes/health-routes.js";
import { registerQuestionRoutes } from "./routes/question-routes.js";
import { registerSubscriptionRoutes } from "./routes/subscription-routes.js";

export function createApp() {
  const app = Fastify({
    logger: true,
  });

  void app.register(cors, {
    origin: true,
    credentials: true,
  });

  void app.register(registerHealthRoutes);
  void app.register(registerQuestionRoutes);
  void app.register(registerSubscriptionRoutes);
  void app.register(registerAdminRoutes);

  return app;
}
