import { z } from "zod";

const platePattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/;

const plateSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => platePattern.test(value), {
    message: "Plate must match a valid Brazilian format (ABC1234 or ABC1D23)."
  });

const nonEmptyText = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(maxLength, `${fieldName} must have at most ${maxLength} characters.`);

export const createVehicleSchema = z.object({
  plate: plateSchema,
  brand: nonEmptyText("Brand", 120),
  model: nonEmptyText("Model", 120),
  year: z.coerce.number().int().min(1886, "Year must be 1886 or later.").max(9999, "Year must have four digits."),
  color: nonEmptyText("Color", 60)
});

export const updateVehicleSchema = createVehicleSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "At least one field must be provided for update."
  }
);

export const vehicleFiltersSchema = z.object({
  brand: z.string().trim().min(1).max(120).optional(),
  year: z.coerce.number().int().min(1886).max(9999).optional()
});

export const vehicleIdParamSchema = z.object({
  id: z.string().uuid("Vehicle id must be a valid UUID.")
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleFiltersInput = z.infer<typeof vehicleFiltersSchema>;
