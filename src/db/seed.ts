import { createDb, createPool } from "./client.js";
import { seedVehicles } from "./seed-data.js";
import { vehicles } from "./schema.js";

async function main() {
  const pool = createPool({ max: 1 });

  try {
    const db = createDb(pool);

    await db
      .insert(vehicles)
      .values(seedVehicles)
      .onConflictDoNothing({ target: vehicles.plate });

    console.log(`Seed completed with ${seedVehicles.length} vehicles.`);
  } finally {
    await pool.end();
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  });
