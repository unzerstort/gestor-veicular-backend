import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { VehicleRecord } from "../src/db/schema.js";
import type { VehicleRepository } from "../src/repositories/vehicle-repository.js";
import type { CreateVehicleInput, UpdateVehicleInput, VehicleFiltersInput } from "../src/schemas/vehicle-schemas.js";
import { VehicleService } from "../src/services/vehicle-service.js";

class InMemoryVehicleRepository implements VehicleRepository {
  private items = new Map<string, VehicleRecord>();

  async create(input: CreateVehicleInput): Promise<VehicleRecord> {
    const id = crypto.randomUUID();
    const now = new Date();
    const vehicle: VehicleRecord = {
      id,
      ...input,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(id, vehicle);
    return vehicle;
  }

  async findAll(filters: VehicleFiltersInput): Promise<VehicleRecord[]> {
    return Array.from(this.items.values()).filter((vehicle) => {
      if (filters.brand && vehicle.brand !== filters.brand) {
        return false;
      }

      if (filters.year && vehicle.year !== filters.year) {
        return false;
      }

      return true;
    });
  }

  async findById(id: string): Promise<VehicleRecord | null> {
    return this.items.get(id) ?? null;
  }

  async findByPlate(plate: string): Promise<VehicleRecord | null> {
    return Array.from(this.items.values()).find((vehicle) => vehicle.plate === plate) ?? null;
  }

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord | null> {
    const current = this.items.get(id);

    if (!current) {
      return null;
    }

    const updated: VehicleRecord = {
      ...current,
      ...input,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}

describe("Vehicle API", () => {
  let repository: InMemoryVehicleRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new InMemoryVehicleRepository();
    const service = new VehicleService(repository);
    app = createApp({ vehicleService: service });
  });

  it("creates a vehicle with a valid payload", async () => {
    const response = await request(app).post("/api/vehicles").send({
      plate: "abc1d23",
      brand: "Volkswagen",
      model: "Gol",
      year: 2020,
      color: "Prata"
    });

    expect(response.status).toBe(201);
    expect(response.body.plate).toBe("ABC1D23");
    expect(response.body.brand).toBe("Volkswagen");
  });

  it("rejects an invalid plate", async () => {
    const response = await request(app).post("/api/vehicles").send({
      plate: "1234567",
      brand: "Volkswagen",
      model: "Gol",
      year: 2020,
      color: "Prata"
    });

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toContain("application/problem+json");
    expect(response.body.title).toBe("Validation error");
    expect(response.body.errors[0].path).toBe("plate");
  });

  it("rejects duplicate plates", async () => {
    await repository.create({
      plate: "ABC1234",
      brand: "Fiat",
      model: "Uno",
      year: 2018,
      color: "Branco"
    });

    const response = await request(app).post("/api/vehicles").send({
      plate: "ABC1234",
      brand: "Ford",
      model: "Ka",
      year: 2021,
      color: "Preto"
    });

    expect(response.status).toBe(409);
    expect(response.body.title).toBe("Resource conflict");
  });

  it("lists vehicles with and without filters", async () => {
    await repository.create({
      plate: "ABC1234",
      brand: "Fiat",
      model: "Uno",
      year: 2018,
      color: "Branco"
    });
    await repository.create({
      plate: "BRA2E19",
      brand: "Ford",
      model: "Ka",
      year: 2021,
      color: "Preto"
    });

    const allResponse = await request(app).get("/api/vehicles");
    const filteredResponse = await request(app).get("/api/vehicles").query({ brand: "Ford", year: "2021" });

    expect(allResponse.status).toBe(200);
    expect(allResponse.body).toHaveLength(2);
    expect(filteredResponse.status).toBe(200);
    expect(filteredResponse.body).toHaveLength(1);
    expect(filteredResponse.body[0].plate).toBe("BRA2E19");
  });

  it("returns 404 for an unknown vehicle id", async () => {
    const response = await request(app).get(`/api/vehicles/${crypto.randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.title).toBe("Resource not found");
  });

  it("updates a vehicle partially while preserving other fields", async () => {
    const vehicle = await repository.create({
      plate: "ABC1234",
      brand: "Fiat",
      model: "Uno",
      year: 2018,
      color: "Branco"
    });

    const response = await request(app).patch(`/api/vehicles/${vehicle.id}`).send({
      color: "Azul"
    });

    expect(response.status).toBe(200);
    expect(response.body.color).toBe("Azul");
    expect(response.body.brand).toBe("Fiat");
    expect(response.body.plate).toBe("ABC1234");
  });

  it("deletes a vehicle and returns 204", async () => {
    const vehicle = await repository.create({
      plate: "ABC1234",
      brand: "Fiat",
      model: "Uno",
      year: 2018,
      color: "Branco"
    });

    const response = await request(app).delete(`/api/vehicles/${vehicle.id}`);

    expect(response.status).toBe(204);
    expect(await repository.findById(vehicle.id)).toBeNull();
  });
});
