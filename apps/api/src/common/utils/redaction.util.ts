const sensitiveKeyPattern = /(password|secret|token|authorization|api[_-]?key|credential|cookie)/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const bearerPattern = /bearer\s+[A-Z0-9._~+/-]+=*/gi;

export function redactOperationalContext(context: unknown): unknown {
  if (Array.isArray(context)) {
    return context.map((entry) => redactOperationalContext(entry));
  }

  if (context && typeof context === 'object') {
    return Object.fromEntries(
      Object.entries(context).map(([key, fieldValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactOperationalContext(fieldValue),
      ]),
    );
  }

  if (typeof context === 'string') {
    return context.replace(bearerPattern, 'Bearer [REDACTED]').replace(emailPattern, '[REDACTED_EMAIL]');
  }

  return context;
}
