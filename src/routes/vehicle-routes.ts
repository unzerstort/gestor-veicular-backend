import { Router } from "express";

import type { VehicleController } from "../controllers/vehicle-controller.js";

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
