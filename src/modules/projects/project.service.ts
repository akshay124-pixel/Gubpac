import { prisma } from '../../database/prisma';
import { NotFoundError } from '../../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

export class ProjectService {
  /**
   * Create a new project within the organization
   */
  async create(data: CreateProjectInput, orgId: string, userId: string) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        orgId,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Get all projects for an organization
   */
  async getAll(orgId: string) {
    const projects = await prisma.project.findMany({
      where: {
        orgId,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  /**
   * Get a single project by ID
   * Ensures project belongs to the specified organization
   */
  async getById(projectId: string, orgId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        orgId,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    return project;
  }

  /**
   * Update a project
   */
  async update(projectId: string, orgId: string, data: UpdateProjectInput) {
    // Verify project exists and belongs to organization
    await this.getById(projectId, orgId);

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Delete a project (soft delete)
   */
  async delete(projectId: string, orgId: string) {
    // Verify project exists and belongs to organization
    await this.getById(projectId, orgId);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Project deleted successfully' };
  }
}
