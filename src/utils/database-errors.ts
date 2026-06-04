type PgError = {
  code?: string;
};

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as PgError).code === "23505";
}
