import { ZodError } from "zod";

import type { ProblemDetailsError } from "../types/problem-details.js";

type AppErrorOptions = {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: ProblemDetailsError[];
};

export class AppError extends Error {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail: string;
  public readonly errors?: ProblemDetailsError[];

  constructor(options: AppErrorOptions) {
    super(options.detail);
    this.name = "AppError";
    this.type = options.type;
    this.title = options.title;
    this.status = options.status;
    this.detail = options.detail;
    this.errors = options.errors;
  }
}

export class ValidationError extends AppError {
  constructor(detail: string, errors?: ProblemDetailsError[]) {
    super({
      type: "https://gestor-veicular.dev/problems/validation-error",
      title: "Validation error",
      status: 400,
      detail,
      errors
    });
  }

  static fromZodError(error: ZodError): ValidationError {
    return new ValidationError(
      "The request payload or query parameters are invalid.",
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code
      }))
    );
  }
}

export class NotFoundError extends AppError {
  constructor(detail = "The requested resource was not found.") {
    super({
      type: "https://gestor-veicular.dev/problems/not-found",
      title: "Resource not found",
      status: 404,
      detail
    });
  }
}

export class ConflictError extends AppError {
  constructor(detail: string) {
    super({
      type: "https://gestor-veicular.dev/problems/conflict",
      title: "Resource conflict",
      status: 409,
      detail
    });
  }
}
