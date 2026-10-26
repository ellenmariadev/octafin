import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { AppError } from "./app-error";

@Catch(AppError)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: AppError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(exception.httpStatus).json({
      statusCode: exception.httpStatus,
      code: exception.code,
      message: exception.message,
    });
  }
}
