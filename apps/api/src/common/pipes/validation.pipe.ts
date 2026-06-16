import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { ErrorDetail } from '../types/api-response.type';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (validationErrors) =>
      new BadRequestException({
        message: 'Validation failed',
        errors: validationDetailsFor(validationErrors),
      }),
  });
}

function validationDetailsFor(validationErrors: ValidationError[]): ErrorDetail[] {
  return validationErrors.flatMap((validationError) =>
    constraintMessagesFor(validationError),
  );
}

function constraintMessagesFor(validationError: ValidationError): ErrorDetail[] {
  const constraintMessages = Object.values(validationError.constraints ?? {});
  return constraintMessages.map((message) => ({
    field: validationError.property,
    message,
  }));
}
