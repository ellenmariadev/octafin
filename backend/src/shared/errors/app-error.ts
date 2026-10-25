import { HttpStatus } from "@nestjs/common";

export type AppErrorCode =
  | "INVALID_INPUT"
  | "SIMULATION_NOT_FOUND"
  | "SIMULATION_CONFLICT"
  | "SIMULATION_ALREADY_CLOSED"
  | "OFFER_ALREADY_TERMINAL"
  | "ENQUEUE_FAILED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super("SIMULATION_NOT_FOUND", message, HttpStatus.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super("SIMULATION_CONFLICT", message, HttpStatus.CONFLICT, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: unknown) {
    super("INVALID_INPUT", message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, details?: unknown) {
    super("ENQUEUE_FAILED", message, HttpStatus.SERVICE_UNAVAILABLE, details);
  }
}

export class InternalError extends AppError {
  constructor(message: string, details?: unknown) {
    super("INTERNAL_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
