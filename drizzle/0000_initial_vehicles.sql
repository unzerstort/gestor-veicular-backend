CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "plate" varchar(7) NOT NULL,
  "brand" varchar(120) NOT NULL,
  "model" varchar(120) NOT NULL,
  "year" integer NOT NULL,
  "color" varchar(60) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
