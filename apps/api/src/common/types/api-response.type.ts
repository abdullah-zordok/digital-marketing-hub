export interface SuccessEnvelope<TPayload> {
  success: true;
  message: string;
  data: TPayload;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  errors: ErrorDetail[];
}

export type ApiEnvelope<TPayload> = SuccessEnvelope<TPayload> | ErrorEnvelope;

export function successEnvelope<TPayload>(
  message: string,
  payload: TPayload,
): SuccessEnvelope<TPayload> {
  return {
    success: true,
    message,
    data: payload,
  };
}
