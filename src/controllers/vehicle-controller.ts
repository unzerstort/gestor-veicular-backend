import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ValidationError } from "../errors/app-error.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleFiltersSchema,
  vehicleIdParamSchema
} from "../schemas/vehicle-schemas.js";
import type { VehicleService } from "../services/vehicle-service.js";

export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createVehicleSchema.parse(req.body);
      const vehicle = await this.service.create(input);
      res.status(201).json(vehicle);
    } catch (error) {
      next(mapValidationError(error));
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = vehicleFiltersSchema.parse(req.query);
      const vehicles = await this.service.list(filters);
      res.status(200).json(vehicles);
    } catch (error) {
      next(mapValidationError(error));
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = vehicleIdParamSchema.parse(req.params);
      const vehicle = await this.service.getById(id);
      res.status(200).json(vehicle);
    } catch (error) {
      next(mapValidationError(error));
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = vehicleIdParamSchema.parse(req.params);
      const input = updateVehicleSchema.parse(req.body);
      const vehicle = await this.service.update(id, input);
      res.status(200).json(vehicle);
    } catch (error) {
      next(mapValidationError(error));
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = vehicleIdParamSchema.parse(req.params);
      await this.service.remove(id);
      res.status(204).send();
    } catch (error) {
      next(mapValidationError(error));
    }
  };
}

function mapValidationError(error: unknown): unknown {
  if (error instanceof ZodError) {
    return ValidationError.fromZodError(error);
  }

  return error;
}
