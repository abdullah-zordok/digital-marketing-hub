import { publicResponseFor } from '../../../src/common/utils/public-response-safety.util';

describe('publicResponseFor', () => {
  it('removes private and internal fields while preserving public content', () => {
    expect(
      publicResponseFor({
        id: 'entity-1',
        title: 'Public title',
        passwordHash: 'secret',
        authorId: 'user-1',
        deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).toEqual({
      id: 'entity-1',
      title: 'Public title',
    });
  });
});
