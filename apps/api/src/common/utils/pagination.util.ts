export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface PaginatedRecords<TRecord> {
  items: TRecord[];
  meta: PageMeta;
}

export function offsetFor(page: number, limit: number): number {
  const pagination = normalizedPagination(page, limit);
  return (pagination.page - 1) * pagination.limit;
}

export function pageMetaFor(page: number, limit: number, totalItems: number): PageMeta {
  const pagination = normalizedPagination(page, limit);
  return {
    page: pagination.page,
    limit: pagination.limit,
    totalItems,
    totalPages: Math.ceil(totalItems / pagination.limit),
  };
}

export function paginatedRecords<TRecord>(
  items: TRecord[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedRecords<TRecord> {
  return {
    items,
    meta: pageMetaFor(page, limit, totalItems),
  };
}

export function normalizedPagination(page: number, limit: number): { page: number; limit: number } {
  return {
    page: positiveIntegerOrDefault(page, DEFAULT_PAGE),
    limit: Math.min(positiveIntegerOrDefault(limit, DEFAULT_LIMIT), MAX_LIMIT),
  };
}

function positiveIntegerOrDefault(candidate: number, fallback: number): number {
  return Number.isInteger(candidate) && candidate > 0 ? candidate : fallback;
}
