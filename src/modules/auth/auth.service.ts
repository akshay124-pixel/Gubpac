import { prisma } from '../../database/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { RegisterInput, LoginInput, RefreshInput, LogoutInput } from './auth.validation';
import { OrgRole } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user and create their organization
   * This ensures every user has an organization context after registration
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user, organization, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      // Create organization membership with org_admin role
      await tx.orgMember.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: OrgRole.org_admin,
        },
      });

      return { user, organization };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    };
  }

  /**
   * Login user and issue tokens
   */
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        orgMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Create refresh token record
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: '', // Will be updated with actual token
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate refresh token with token ID
    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id,
    });

    // Update refresh token record with actual token
    await prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { token: refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organizations: user.orgMemberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      })),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(data: RefreshInput) {
    // Verify refresh token
    const payload = verifyRefreshToken(data.refreshToken);

    // Find refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (refreshTokenRecord.revoked) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (refreshTokenRecord.token !== data.refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date() > refreshTokenRecord.expiresAt) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: refreshTokenRecord.user.id,
      email: refreshTokenRecord.user.email,
    });

    return { accessToken };
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(data: LogoutInput) {
    try {
      const payload = verifyRefreshToken(data.refreshToken);

      await prisma.refreshToken.update({
        where: { id: payload.tokenId },
        data: { revoked: true },
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      // Even if token is invalid, return success
      return { message: 'Logged out successfully' };
    }
  }
}
