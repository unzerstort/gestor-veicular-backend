import type { VehicleRecord } from "../db/schema.js";
import { ConflictError, NotFoundError } from "../errors/app-error.js";
import type { CreateVehicleInput, UpdateVehicleInput, VehicleFiltersInput } from "../schemas/vehicle-schemas.js";
import { isUniqueViolation } from "../utils/database-errors.js";
import type { VehicleRepository } from "../repositories/vehicle-repository.js";

export class VehicleService {
  constructor(private readonly repository: VehicleRepository) {}

  async create(input: CreateVehicleInput): Promise<VehicleRecord> {
    const existing = await this.repository.findByPlate(input.plate);

    if (existing) {
      throw new ConflictError(`A vehicle with plate ${input.plate} already exists.`);
    }

    try {
      return await this.repository.create(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError(`A vehicle with plate ${input.plate} already exists.`);
      }

      throw error;
    }
  }

  list(filters: VehicleFiltersInput): Promise<VehicleRecord[]> {
    return this.repository.findAll(filters);
  }

  async getById(id: string): Promise<VehicleRecord> {
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found.");
    }

    return vehicle;
  }

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord> {
    const current = await this.repository.findById(id);

    if (!current) {
      throw new NotFoundError("Vehicle not found.");
    }

    if (input.plate) {
      const vehicleWithPlate = await this.repository.findByPlate(input.plate);

      if (vehicleWithPlate && vehicleWithPlate.id !== id) {
        throw new ConflictError(`A vehicle with plate ${input.plate} already exists.`);
      }
    }

    try {
      const updated = await this.repository.update(id, input);

      if (!updated) {
        throw new NotFoundError("Vehicle not found.");
      }

      return updated;
    } catch (error) {
      if (isUniqueViolation(error) && input.plate) {
        throw new ConflictError(`A vehicle with plate ${input.plate} already exists.`);
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError("Vehicle not found.");
    }
  }
}
