const privateFieldNames = new Set([
  'password',
  'passwordHash',
  'refreshTokenHash',
  'deletedAt',
  'internalNotes',
  'metadata',
  'authorId',
]);

export function publicResponseFor<TPublic extends Record<string, unknown>>(responseBody: TPublic): Partial<TPublic> {
  return Object.fromEntries(
    Object.entries(responseBody).filter(([fieldName]) => !privateFieldNames.has(fieldName)),
  ) as Partial<TPublic>;
}
