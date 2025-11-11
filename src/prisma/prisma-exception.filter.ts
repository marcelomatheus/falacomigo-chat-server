import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    error:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const context = `${request.method} ${request.url}`;

    const messageLines = error.message?.split('\n') ?? [];
    const messageError =
      messageLines.pop()?.trim() ?? error.message ?? 'Unknown error';

    const fullMessage =
      messageError.concat(` (${context})`) ||
      'An error occurred while executing the operation';

    console.error(
      `PRISMA ERROR ${(error as Prisma.PrismaClientKnownRequestError).code || 'N/A'} [${context}]: ${messageError}`,
    );

    throw new UnprocessableEntityException(fullMessage);
  }
}
