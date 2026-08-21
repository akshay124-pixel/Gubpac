import { calculatePagination, createPaginationResult } from '../pagination';

describe('Pagination Utils', () => {
  describe('calculatePagination', () => {
    it('should calculate correct skip and take for valid inputs', () => {
      const result = calculatePagination(2, 20);
      expect(result).toEqual({
        skip: 20,
        take: 20,
        page: 2,
        limit: 20,
      });
    });

    it('should handle page 1 correctly', () => {
      const result = calculatePagination(1, 10);
      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should enforce maximum limit of 100', () => {
      const result = calculatePagination(1, 150);
      expect(result.take).toBe(100);
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum page of 1', () => {
      const result = calculatePagination(0, 20);
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should enforce minimum limit of 1', () => {
      const result = calculatePagination(1, 0);
      expect(result.limit).toBe(1);
      expect(result.take).toBe(1);
    });
  });

  describe('createPaginationResult', () => {
    it('should create correct pagination result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginationResult(data, 50, { page: 2, limit: 20 });

      expect(result).toEqual({
        data,
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      });
    });

    it('should handle exact page division', () => {
      const data = [{ id: 1 }];
      const result = createPaginationResult(data, 40, { page: 1, limit: 20 });

      expect(result.totalPages).toBe(2);
    });

    it('should handle single page result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginationResult(data, 2, { page: 1, limit: 20 });

      expect(result.totalPages).toBe(1);
    });
  });
});
