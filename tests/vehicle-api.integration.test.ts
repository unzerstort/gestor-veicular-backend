import { readFile } from "node:fs/promises";
import path from "node:path";

import { config } from "dotenv";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../src/app.js";
import { createDb, createPool } from "../src/db/client.js";
import { DrizzleVehicleRepository } from "../src/repositories/drizzle-vehicle-repository.js";
import { VehicleService } from "../src/services/vehicle-service.js";

config();

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL or DATABASE_URL must be defined for integration tests.");
}

const migrationPath = path.resolve(process.cwd(), "drizzle/0000_initial_vehicles.sql");
const pool = createPool({
  connectionString: testDatabaseUrl,
  nodeEnv: "test",
  sslMode: "disable",
  max: 1
});
const db = createDb(pool);
const repository = new DrizzleVehicleRepository(db);
const service = new VehicleService(repository);
const app = createApp({ vehicleService: service });

describe("Vehicle API integration", () => {
  beforeAll(async () => {
    const migrationSql = await readFile(migrationPath, "utf8");
    await pool.query(migrationSql);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE "vehicles";');
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates and lists vehicles using PostgreSQL", async () => {
    const createResponse = await request(app).post("/api/vehicles").send({
      plate: "ABC1D23",
      brand: "Volkswagen",
      model: "Gol",
      year: 2020,
      color: "Prata"
    });

    const listResponse = await request(app).get("/api/vehicles");

    expect(createResponse.status).toBe(201);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].plate).toBe("ABC1D23");
  });

  it("returns conflict for duplicate plates against the real database", async () => {
    await request(app).post("/api/vehicles").send({
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

  it("supports filtering and partial updates with PostgreSQL", async () => {
    const created = await request(app).post("/api/vehicles").send({
      plate: "BRA2E19",
      brand: "Ford",
      model: "Ka",
      year: 2021,
      color: "Preto"
    });

    const filtered = await request(app).get("/api/vehicles").query({ brand: "Ford", year: 2021 });
    const updated = await request(app).patch(`/api/vehicles/${created.body.id}`).send({ color: "Azul" });

    expect(filtered.status).toBe(200);
    expect(filtered.body).toHaveLength(1);
    expect(updated.status).toBe(200);
    expect(updated.body.color).toBe("Azul");
  });
});
