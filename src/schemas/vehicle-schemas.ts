import { z } from "zod";

const platePattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/;

const plateSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => platePattern.test(value), {
    message: "Placa deve corresponder a um formato brasileiro válido (ABC1234 ou ABC1D23)."
  });

const nonEmptyText = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} é obrigatório.`)
    .max(maxLength, `${fieldName} deve ter no máximo ${maxLength} caracteres.`);

export const createVehicleSchema = z.object({
  plate: plateSchema,
  brand: nonEmptyText("Brand", 120),
  model: nonEmptyText("Model", 120),
  year: z.coerce.number().int().min(1950, "O ano deve estar entre 1950 e 2026.").max(2026, "O ano deve ter quatro dígitos."),
  color: nonEmptyText("Color", 60)
});

export const updateVehicleSchema = createVehicleSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "Ao menos um campo deve ser fornecido para atualização."
  }
);

export const vehicleFiltersSchema = z.object({
  brand: z.string().trim().min(1).max(120).optional(),
  year: z.coerce.number().int().min(1950).max(2026).optional()
});

export const vehicleIdParamSchema = z.object({
  id: z.string().uuid("ID do veículo deve ser um UUID válido.")
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleFiltersInput = z.infer<typeof vehicleFiltersSchema>;
