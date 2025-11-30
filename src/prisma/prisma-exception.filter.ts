import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    error:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.handleKnownError(error, response);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      this.handleValidationError(error, response);
    } else {
      this.handleUnknownError(error, response);
    }
  }

  private handleKnownError(
    error: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    const code = error.code;

    switch (error.code) {
      case 'P2002': // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${field} already exists`;
        break;

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      case 'P2003': // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related record';
        break;

      case 'P2014': // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation is missing';
        break;

      case 'P2011': // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        const nullField = error.meta?.column_name || 'field';
        message = `Required field ${nullField} cannot be null`;
        break;

      default:
        console.error(`Unhandled Prisma error code ${error.code}:`, error);
        message = 'Database error occurred';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: code,
      timestamp: new Date().toISOString(),
    });
  }

  private handleValidationError(
    error: Prisma.PrismaClientValidationError,
    response: Response,
  ) {
    console.error('Prisma Validation Error:', error.message);
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided',
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  private handleUnknownError(
    error: Prisma.PrismaClientUnknownRequestError,
    response: Response,
  ) {
    console.error('Unknown Prisma Error:', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred',
      error: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
}
