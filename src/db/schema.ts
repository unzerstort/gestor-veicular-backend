import { pgTable, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  plate: varchar("plate", { length: 7 }).notNull().unique(),
  brand: varchar("brand", { length: 120 }).notNull(),
  model: varchar("model", { length: 120 }).notNull(),
  year: integer("year").notNull(),
  color: varchar("color", { length: 60 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type VehicleRecord = typeof vehicles.$inferSelect;
export type NewVehicleRecord = typeof vehicles.$inferInsert;
