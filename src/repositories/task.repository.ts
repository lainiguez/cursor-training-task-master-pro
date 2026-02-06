import { Prisma, Task, TaskStatus, Priority } from '@prisma/client';
import { prisma } from '../config/database';

export class TaskRepository {
    async create(data: Prisma.TaskCreateInput): Promise<Task> {
        return prisma.task.create({ data });
    }

    async findAll(filter?: {
        status?: TaskStatus;
        priority?: Priority;
        search?: string;
    }): Promise<Task[]> {
        const where: Prisma.TaskWhereInput = {
            deletedAt: null,
        };

        if (filter?.status) {
            where.status = filter.status;
        }

        if (filter?.priority) {
            where.priority = filter.priority;
        }

        if (filter?.search) {
            where.description = {
                contains: filter.search,
            };
            // OR could be title or description, but prompt said "search description"
            // Let's make it flexible to search title too or just description as requested.
            // Requirement: "search description". I'll stick to that but adding title is nice.
            // "Flexible Filter Function (filter by status, priority, or search description)"
        }

        return prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string): Promise<Task | null> {
        return prisma.task.findFirst({
            where: { id, deletedAt: null },
        });
    }

    async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async softDelete(id: string): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
