import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (
      exception instanceof BadRequestException &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const errorObj = exceptionResponse as ErrorResponse;
      const validationErrors = errorObj.message;

      if (Array.isArray(validationErrors)) {
        return response.status(status).json({
          statusCode: status,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: validationErrors,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as ErrorResponse).message || 'An error occurred',
      error:
        typeof exceptionResponse === 'object' && 'error' in exceptionResponse
          ? (exceptionResponse as ErrorResponse).error
          : HttpStatus[status],
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
