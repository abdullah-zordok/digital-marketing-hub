import { redactOperationalContext } from '../../../src/common/utils/redaction.util';

describe('redactOperationalContext', () => {
  it('redacts secrets by key and personal email values', () => {
    expect(
      redactOperationalContext({
        password: 'secret',
        nested: { apiKey: 'abc123', contact: 'person@example.com' },
      }),
    ).toEqual({
      password: '[REDACTED]',
      nested: { apiKey: '[REDACTED]', contact: '[REDACTED_EMAIL]' },
    });
  });

  it('redacts bearer tokens inside strings', () => {
    expect(redactOperationalContext('Authorization: Bearer abc.def.ghi')).toBe(
      'Authorization: Bearer [REDACTED]',
    );
  });
});
