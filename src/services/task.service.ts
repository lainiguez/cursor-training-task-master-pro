import { TaskRepository } from '../repositories/task.repository';
import { Task, TaskStatus, Priority } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../middlewares/error.middleware';

// Validation Schemas
export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    userId: z.string().min(1, "User ID is required"),
});

export const updateTaskSchema = z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
});

export class TaskService {
    private taskRepository: TaskRepository;

    constructor() {
        this.taskRepository = new TaskRepository();
    }

    async createTask(data: unknown): Promise<Task> {
        const validatedData = createTaskSchema.parse(data);
        return this.taskRepository.create({
            title: validatedData.title,
            description: validatedData.description,
            priority: validatedData.priority || Priority.MEDIUM,
            status: TaskStatus.PENDING,
            userId: validatedData.userId,
        });
    }

    async getTasks(filter: { status?: string; priority?: string; search?: string }): Promise<Task[]> {
        // Validate enums strictly? Or allow flexible string matching and let repository/prisma handle/ignore?
        // Repository expects strict types. Let's cast or validate.
        // Simplest for now: cast if valid, else undefined.

        const status = Object.values(TaskStatus).includes(filter.status as TaskStatus)
            ? (filter.status as TaskStatus)
            : undefined;

        const priority = Object.values(Priority).includes(filter.priority as Priority)
            ? (filter.priority as Priority)
            : undefined;

        return this.taskRepository.findAll({
            status,
            priority,
            search: filter.search,
        });
    }

    async getTaskById(id: string): Promise<Task | null> {
        return this.taskRepository.findById(id);
    }

    async updateTaskStatusOrPriority(id: string, data: unknown): Promise<Task> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new AppError('Task not found', 404);
        }
        const validatedData = updateTaskSchema.parse(data);
        return this.taskRepository.update(id, validatedData);
    }

    async deleteTask(id: string): Promise<void> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new AppError('Task not found', 404);
        }
        await this.taskRepository.softDelete(id);
    }
}
