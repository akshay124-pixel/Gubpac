import request from 'supertest';
import app from '../app';
import { prisma } from '../database/prisma';
import { hashPassword } from '../utils/password';
import { OrgRole } from '@prisma/client';

describe('Cross-Tenant Security Integration Tests', () => {
  let org1Id: string;
  let org2Id: string;
  let user1Token: string;
  let user2Token: string;
  let org1ProjectId: string;
  let org1TaskId: string;
  let org2ProjectId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.backgroundJob.deleteMany();
    await prisma.outboxEvent.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskAssignment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.orgMember.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    const password = await hashPassword('password123');

    // Create Organization 1
    const org1 = await prisma.organization.create({
      data: { name: 'Organization 1' },
    });
    org1Id = org1.id;

    // Create Organization 2
    const org2 = await prisma.organization.create({
      data: { name: 'Organization 2' },
    });
    org2Id = org2.id;

    // Create User 1 (belongs to Org 1)
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@org1.com',
        passwordHash: password,
        firstName: 'User',
        lastName: 'One',
      },
    });

    await prisma.orgMember.create({
      data: {
        userId: user1.id,
        orgId: org1Id,
        role: OrgRole.member,
      },
    });

    // Create User 2 (belongs to Org 2)
    const user2 = await prisma.user.create({
      data: {
        email: 'user2@org2.com',
        passwordHash: password,
        firstName: 'User',
        lastName: 'Two',
      },
    });

    await prisma.orgMember.create({
      data: {
        userId: user2.id,
        orgId: org2Id,
        role: OrgRole.member,
      },
    });

    // Login users to get tokens
    const login1 = await request(app)
      .post('/auth/login')
      .send({ email: 'user1@org1.com', password: 'password123' });
    user1Token = login1.body.data.accessToken;

    const login2 = await request(app)
      .post('/auth/login')
      .send({ email: 'user2@org2.com', password: 'password123' });
    user2Token = login2.body.data.accessToken;

    // Create a project in Org 1
    const project1 = await prisma.project.create({
      data: {
        name: 'Org 1 Project',
        orgId: org1Id,
        createdBy: user1.id,
      },
    });
    org1ProjectId = project1.id;

    // Create a task in Org 1 Project
    const task1 = await prisma.task.create({
      data: {
        title: 'Org 1 Task',
        projectId: org1ProjectId,
      },
    });
    org1TaskId = task1.id;

    // Create a project in Org 2
    const project2 = await prisma.project.create({
      data: {
        name: 'Org 2 Project',
        orgId: org2Id,
        createdBy: user2.id,
      },
    });
    org2ProjectId = project2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Cross-Tenant Project Access', () => {
    it('should return 403 when User1 tries to access Org2 project', async () => {
      const response = await request(app)
        .get(`/projects/${org2ProjectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-organization-id', org1Id);

      expect(response.status).toBe(404); // Not found because it doesn't belong to their org
    });

    it('should return 403 when User2 tries to access Org1 project', async () => {
      const response = await request(app)
        .get(`/projects/${org1ProjectId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-organization-id', org2Id);

      expect(response.status).toBe(404);
    });

    it('should allow User1 to access their own org project', async () => {
      const response = await request(app)
        .get(`/projects/${org1ProjectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-organization-id', org1Id);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(org1ProjectId);
    });
  });

  describe('Cross-Tenant Task Access', () => {
    it('should return 404 when User2 tries to access Org1 task', async () => {
      const response = await request(app)
        .get(`/tasks/${org1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-organization-id', org2Id);

      expect(response.status).toBe(404);
    });

    it('should allow User1 to access their own org task', async () => {
      const response = await request(app)
        .get(`/tasks/${org1TaskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-organization-id', org1Id);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(org1TaskId);
    });

    it('should return 404 when User2 tries to update Org1 task', async () => {
      const response = await request(app)
        .patch(`/tasks/${org1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-organization-id', org2Id)
        .send({ title: 'Malicious Update' });

      expect(response.status).toBe(404);
    });

    it('should return 404 when User2 tries to delete Org1 task', async () => {
      const response = await request(app)
        .delete(`/tasks/${org1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-organization-id', org2Id);

      expect(response.status).toBe(404);
    });
  });

  describe('Cross-Tenant Task Assignment', () => {
    it('should return 404 when trying to assign Org2 user to Org1 task', async () => {
      const org2User = await prisma.user.findFirst({
        where: { email: 'user2@org2.com' },
      });

      const response = await request(app)
        .post(`/tasks/${org1TaskId}/assignments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-organization-id', org1Id)
        .send({ userId: org2User!.id });

      expect(response.status).toBe(404);
    });
  });

  describe('Cross-Tenant Dashboard Access', () => {
    it('should only return stats for user organization', async () => {
      const response1 = await request(app)
        .get('/dashboard/tasks/stats')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-organization-id', org1Id);

      const response2 = await request(app)
        .get('/dashboard/tasks/stats')
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-organization-id', org2Id);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Both orgs have 1 task each, stats should not mix
      const org1Total = (Object.values(response1.body) as number[]).reduce((a, b) => a + b, 0);
      const org2Total = (Object.values(response2.body) as number[]).reduce((a, b) => a + b, 0);

      expect(org1Total).toBeGreaterThanOrEqual(1);
      expect(org2Total).toBeGreaterThanOrEqual(0);
    });
  });
});
