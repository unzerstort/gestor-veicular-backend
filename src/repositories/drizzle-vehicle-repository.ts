import { and, eq, type SQL } from "drizzle-orm";

import type { CreateVehicleInput, UpdateVehicleInput, VehicleFiltersInput } from "../schemas/vehicle-schemas.js";
import { getDb, type DbClient } from "../db/client.js";
import { vehicles, type VehicleRecord } from "../db/schema.js";
import type { VehicleRepository } from "./vehicle-repository.js";

export class DrizzleVehicleRepository implements VehicleRepository {
  constructor(private readonly db: DbClient = getDb()) {}

  async create(input: CreateVehicleInput): Promise<VehicleRecord> {
    const [vehicle] = await this.db.insert(vehicles).values(input).returning();
    return vehicle;
  }

  async findAll(filters: VehicleFiltersInput): Promise<VehicleRecord[]> {
    const conditions: SQL[] = [];

    if (filters.brand) {
      conditions.push(eq(vehicles.brand, filters.brand));
    }

    if (filters.year) {
      conditions.push(eq(vehicles.year, filters.year));
    }

    if (conditions.length === 0) {
      return this.db.select().from(vehicles);
    }

    return this.db.select().from(vehicles).where(and(...conditions));
  }

  async findById(id: string): Promise<VehicleRecord | null> {
    const [vehicle] = await this.db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle ?? null;
  }

  async findByPlate(plate: string): Promise<VehicleRecord | null> {
    const [vehicle] = await this.db.select().from(vehicles).where(eq(vehicles.plate, plate));
    return vehicle ?? null;
  }

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord | null> {
    const [vehicle] = await this.db
      .update(vehicles)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(vehicles.id, id))
      .returning();

    return vehicle ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(vehicles).where(eq(vehicles.id, id)).returning({ id: vehicles.id });
    return deleted.length > 0;
  }
}
