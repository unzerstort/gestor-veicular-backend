import cors from "cors";
import express, { type Express } from "express";

import { VehicleController } from "./controllers/vehicle-controller.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { DrizzleVehicleRepository } from "./repositories/drizzle-vehicle-repository.js";
import { createApiRouter } from "./routes/index.js";
import { VehicleService } from "./services/vehicle-service.js";

type AppDependencies = {
  vehicleService: VehicleService;
};

export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  const controller = new VehicleController(dependencies.vehicleService);

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createApiRouter(controller));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

let cachedApp: Express | null = null;

export function createDefaultApp(): Express {
  if (!cachedApp) {
    const repository = new DrizzleVehicleRepository();
    const vehicleService = new VehicleService(repository);
    cachedApp = createApp({ vehicleService });
  }

  return cachedApp;
}
