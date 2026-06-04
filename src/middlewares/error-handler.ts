import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import type { ProblemDetails } from "../types/problem-details.js";

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const problem = toProblemDetails(error, req.originalUrl);
  res
    .status(problem.status)
    .type("application/problem+json")
    .json(problem);
}

function toProblemDetails(error: unknown, instance: string): ProblemDetails {
  if (error instanceof AppError) {
    return {
      type: error.type,
      title: error.title,
      status: error.status,
      detail: error.detail,
      instance,
      ...(error.errors ? { errors: error.errors } : {})
    };
  }

  return {
    type: "https://gestor-veicular.dev/problems/internal-server-error",
    title: "Internal server error",
    status: 500,
    detail: "An unexpected error occurred.",
    instance
  };
}
