import { Router } from "express";

import type { VehicleController } from "../controllers/vehicle-controller.js";
import { createVehicleRouter } from "./vehicle-routes.js";

export function createApiRouter(controller: VehicleController): Router {
  const router = Router();

  router.use("/vehicles", createVehicleRouter(controller));

  return router;
}
