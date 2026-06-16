import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { ErrorDetail, ErrorEnvelope } from '../types/api-response.type';

interface ExceptionBody {
  message?: string | string[];
  errors?: ErrorDetail[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const statusCode = this.statusCodeFor(exception);
    const responseBody = this.responseBodyFor(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(this.messageFor(exception));
    }

    response.status(statusCode).json(this.errorEnvelope(responseBody));
  }

  private statusCodeFor(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private responseBodyFor(exception: unknown): ExceptionBody {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      return typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as ExceptionBody);
    }

    return { message: 'Unexpected server error' };
  }

  private errorEnvelope(exceptionBody: ExceptionBody): ErrorEnvelope {
    const details = this.errorDetailsFor(exceptionBody);
    return {
      success: false,
      message: this.publicMessageFor(exceptionBody),
      errors: details,
    };
  }

  private publicMessageFor(exceptionBody: ExceptionBody): string {
    return Array.isArray(exceptionBody.message)
      ? 'Validation failed'
      : exceptionBody.message ?? 'Request failed';
  }

  private errorDetailsFor(exceptionBody: ExceptionBody): ErrorDetail[] {
    if (exceptionBody.errors?.length) {
      return exceptionBody.errors;
    }

    if (Array.isArray(exceptionBody.message)) {
      return exceptionBody.message.map((message) => ({ message }));
    }

    return [];
  }

  private messageFor(exception: unknown): string {
    return exception instanceof Error ? exception.stack ?? exception.message : String(exception);
  }
}
