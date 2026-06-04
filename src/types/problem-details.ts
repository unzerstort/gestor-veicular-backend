export type ProblemDetailsError = {
  path: string;
  message: string;
  code: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: ProblemDetailsError[];
};
