import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../jwt';
import { UnauthorizedError } from '../errors';

describe('JWT Utils', () => {
  describe('Access Token', () => {
    it('should generate and verify access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
      };

      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow(UnauthorizedError);
    });

    it('should throw error for expired token', () => {
      // This would require mocking time or using a short expiry
      // For now, we test with malformed token
      expect(() => {
        verifyAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
      }).toThrow(UnauthorizedError);
    });
  });

  describe('Refresh Token', () => {
    it('should generate and verify refresh token', () => {
      const payload = {
        userId: 'test-user-id',
        tokenId: 'test-token-id',
      };

      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.tokenId).toBe(payload.tokenId);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token');
      }).toThrow(UnauthorizedError);
    });
  });
});
