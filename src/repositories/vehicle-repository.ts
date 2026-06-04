import type { CreateVehicleInput, UpdateVehicleInput, VehicleFiltersInput } from "../schemas/vehicle-schemas.js";
import type { VehicleRecord } from "../db/schema.js";

export interface VehicleRepository {
  create(input: CreateVehicleInput): Promise<VehicleRecord>;
  findAll(filters: VehicleFiltersInput): Promise<VehicleRecord[]>;
  findById(id: string): Promise<VehicleRecord | null>;
  findByPlate(plate: string): Promise<VehicleRecord | null>;
  update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord | null>;
  delete(id: string): Promise<boolean>;
}
