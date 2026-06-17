import { normalizedPagination, offsetFor, pageMetaFor, paginatedRecords } from '../../../src/common/utils/pagination.util';

describe('pagination utilities', () => {
  it('calculates offset and metadata for bounded pages', () => {
    expect(offsetFor(3, 10)).toBe(20);
    expect(pageMetaFor(2, 5, 12)).toEqual({
      page: 2,
      limit: 5,
      totalItems: 12,
      totalPages: 3,
    });
  });

  it('returns items with page metadata', () => {
    expect(paginatedRecords(['a', 'b'], 1, 2, 5)).toEqual({
      items: ['a', 'b'],
      meta: {
        page: 1,
        limit: 2,
        totalItems: 5,
        totalPages: 3,
      },
    });
  });

  it('clamps invalid and oversized pagination values', () => {
    expect(normalizedPagination(0, 500)).toEqual({ page: 1, limit: 100 });
    expect(offsetFor(-1, 500)).toBe(0);
    expect(pageMetaFor(1, 500, 250)).toMatchObject({ limit: 100, totalPages: 3 });
  });
});
