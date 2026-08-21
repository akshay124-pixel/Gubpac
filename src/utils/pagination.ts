import { PaginationParams, PaginationResult } from '../types';

export function calculatePagination(page: number, limit: number) {
  const maxLimit = 100;
  const validLimit = Math.min(Math.max(limit, 1), maxLimit);
  const validPage = Math.max(page, 1);
  const skip = (validPage - 1) * validLimit;

  return { skip, take: validLimit, page: validPage, limit: validLimit };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
  };
}
