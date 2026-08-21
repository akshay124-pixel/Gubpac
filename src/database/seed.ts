import { prisma } from './prisma';
import { hashPassword } from '../utils/password';
import { OrgRole, TaskStatus, TaskPriority } from '@prisma/client';
import { logger } from '../config/logger';

async function main() {
  logger.info('🌱 Starting database seed...');

  // Clear existing data
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

  logger.info('Cleared existing data');

  // Hash password for all users
  const password = await hashPassword('password123');

  // Create Organization 1
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      description: 'Innovation at its finest',
    },
  });

  // Create Organization 2
  const org2 = await prisma.organization.create({
    data: {
      name: 'TechStart Inc',
      description: 'Building the future',
    },
  });

  logger.info('Created organizations');

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'john.admin@acme.com',
      passwordHash: password,
      firstName: 'John',
      lastName: 'Admin',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.doe@acme.com',
      passwordHash: password,
      firstName: 'Jane',
      lastName: 'Doe',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'bob.smith@acme.com',
      passwordHash: password,
      firstName: 'Bob',
      lastName: 'Smith',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'alice.admin@techstart.com',
      passwordHash: password,
      firstName: 'Alice',
      lastName: 'Admin',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'charlie.dev@techstart.com',
      passwordHash: password,
      firstName: 'Charlie',
      lastName: 'Developer',
    },
  });

  logger.info('Created users');

  // Create Organization Memberships
  await prisma.orgMember.createMany({
    data: [
      { userId: user1.id, orgId: org1.id, role: OrgRole.org_admin },
      { userId: user2.id, orgId: org1.id, role: OrgRole.member },
      { userId: user3.id, orgId: org1.id, role: OrgRole.member },
      { userId: user4.id, orgId: org2.id, role: OrgRole.org_admin },
      { userId: user5.id, orgId: org2.id, role: OrgRole.member },
    ],
  });

  logger.info('Created organization memberships');

  // Create Projects for Org 1
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website',
      orgId: org1.id,
      createdBy: user1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build iOS and Android mobile applications',
      orgId: org1.id,
      createdBy: user1.id,
    },
  });

  // Create Projects for Org 2
  const project3 = await prisma.project.create({
    data: {
      name: 'API Development',
      description: 'RESTful API for customer portal',
      orgId: org2.id,
      createdBy: user4.id,
    },
  });

  logger.info('Created projects');

  // Create Tasks for Project 1 (Website Redesign)
  const task1 = await prisma.task.create({
    data: {
      title: 'Design new homepage mockup',
      description: 'Create high-fidelity mockups for the new homepage',
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      dueDate: new Date('2024-09-01'),
      projectId: project1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Develop responsive navigation',
      description: 'Implement mobile-friendly navigation component',
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      dueDate: new Date('2024-09-15'),
      projectId: project1.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Optimize page load speed',
      description: 'Improve performance metrics and loading times',
      status: TaskStatus.review,
      priority: TaskPriority.medium,
      dueDate: new Date('2024-09-20'),
      projectId: project1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'SEO optimization',
      description: 'Implement meta tags, schema markup, and sitemap',
      status: TaskStatus.done,
      priority: TaskPriority.medium,
      projectId: project1.id,
    },
  });

  // Create Tasks for Project 2 (Mobile App)
  await prisma.task.create({
    data: {
      title: 'Design app UI/UX',
      description: 'Create wireframes and design system for mobile app',
      status: TaskStatus.done,
      priority: TaskPriority.urgent,
      dueDate: new Date('2024-08-25'),
      projectId: project2.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Build login and registration flows',
      status: TaskStatus.in_progress,
      priority: TaskPriority.urgent,
      dueDate: new Date('2024-09-10'),
      projectId: project2.id,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Setup push notifications',
      description: 'Integrate Firebase Cloud Messaging',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: new Date('2024-10-01'),
      projectId: project2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'App store submission',
      description: 'Prepare and submit app to iOS App Store and Google Play',
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      dueDate: new Date('2024-11-01'),
      projectId: project2.id,
    },
  });

  // Create Tasks for Project 3 (API Development)
  await prisma.task.create({
    data: {
      title: 'Design API architecture',
      description: 'Define endpoints, data models, and authentication strategy',
      status: TaskStatus.done,
      priority: TaskPriority.high,
      projectId: project3.id,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: 'Implement user endpoints',
      description: 'CRUD operations for user management',
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      dueDate: new Date('2024-09-05'),
      projectId: project3.id,
    },
  });

  const task11 = await prisma.task.create({
    data: {
      title: 'Write API documentation',
      description: 'Create comprehensive API documentation using Swagger',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: new Date('2024-09-20'),
      projectId: project3.id,
    },
  });

  logger.info('Created tasks');

  // Create Task Assignments
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: task1.id, userId: user2.id },
      { taskId: task2.id, userId: user3.id },
      { taskId: task3.id, userId: user2.id },
      { taskId: task6.id, userId: user3.id },
      { taskId: task7.id, userId: user2.id },
      { taskId: task10.id, userId: user5.id },
      { taskId: task11.id, userId: user5.id },
    ],
  });

  logger.info('Created task assignments');

  // Create Comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'The mockups look great! Just need to adjust the color scheme.',
        taskId: task1.id,
        authorId: user1.id,
      },
      {
        content: 'Working on the mobile breakpoints now.',
        taskId: task2.id,
        authorId: user3.id,
      },
      {
        content: 'Reduced page load time by 40%!',
        taskId: task3.id,
        authorId: user2.id,
      },
      {
        content: 'Authentication flow is complete and tested.',
        taskId: task6.id,
        authorId: user3.id,
      },
      {
        content: 'Need to review the notification permissions handling.',
        taskId: task7.id,
        authorId: user1.id,
      },
    ],
  });

  logger.info('Created comments');

  logger.info('✅ Database seeding completed successfully!');
  logger.info('\n📋 Seed Data Summary:');
  logger.info('  Organizations: 2');
  logger.info('  Users: 5');
  logger.info('  Projects: 3');
  logger.info('  Tasks: 11');
  logger.info('  Task Assignments: 7');
  logger.info('  Comments: 5');
  logger.info('\n🔐 Test Credentials:');
  logger.info('  Org 1 Admin: john.admin@acme.com / password123');
  logger.info('  Org 1 Member: jane.doe@acme.com / password123');
  logger.info('  Org 1 Member: bob.smith@acme.com / password123');
  logger.info('  Org 2 Admin: alice.admin@techstart.com / password123');
  logger.info('  Org 2 Member: charlie.dev@techstart.com / password123');
}

main()
  .catch((error) => {
    logger.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
