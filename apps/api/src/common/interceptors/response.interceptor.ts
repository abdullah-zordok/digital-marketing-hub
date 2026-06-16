import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { SuccessEnvelope, successEnvelope } from '../types/api-response.type';

interface MessagePayload<TPayload> {
  message?: string;
  payload: TPayload;
}

@Injectable()
export class ResponseInterceptor<TPayload>
  implements NestInterceptor<TPayload, SuccessEnvelope<TPayload>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<TPayload | MessagePayload<TPayload>>,
  ): Observable<SuccessEnvelope<TPayload>> {
    return next.handle().pipe(map((body) => this.envelopeFor(body)));
  }

  private envelopeFor(body: TPayload | MessagePayload<TPayload>): SuccessEnvelope<TPayload> {
    if (this.hasMessagePayload(body)) {
      return successEnvelope(body.message ?? 'Request completed successfully', body.payload);
    }

    return successEnvelope('Request completed successfully', body as TPayload);
  }

  private hasMessagePayload(body: unknown): body is MessagePayload<TPayload> {
    return Boolean(
      body &&
        typeof body === 'object' &&
        'payload' in body &&
        !('success' in body),
    );
  }
}
