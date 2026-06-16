export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedRecords<TRecord> {
  items: TRecord[];
  meta: PageMeta;
}

export function offsetFor(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function pageMetaFor(page: number, limit: number, totalItems: number): PageMeta {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
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
