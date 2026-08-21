import request from 'supertest';
import app from '../app';
import { prisma } from '../database/prisma';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany();
    await prisma.orgMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          organizationName: 'Test Org',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.organization.name).toBe('Test Org');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User',
          organizationName: 'Another Org',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('CONFLICT');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.organizations).toHaveLength(1);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      const { refreshToken } = loginResponse.body.data;

      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});
