import { TaskRepository } from './task.repository';
import { prisma } from '../config/database';

jest.mock('../config/database', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('TaskRepository', () => {
    let taskRepository: TaskRepository;
    const mockDate = new Date();

    const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
        deletedAt: null,
    };

    beforeEach(() => {
        taskRepository = new TaskRepository();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new task', async () => {
            (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

            const result = await taskRepository.create({
                title: 'Test Task',
                description: 'Test Description',
                userId: 'user-123',
            });

            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    title: 'Test Task',
                    description: 'Test Description',
                    userId: 'user-123',
                },
            });
            expect(result).toEqual(mockTask);
        });
    });

    describe('findAll', () => {
        it('should return all non-deleted tasks', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTask]);

            const result = await taskRepository.findAll();

            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual([mockTask]);
        });

        it('should filter by status', async () => {
            await taskRepository.findAll({ status: 'COMPLETED' as any });

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { deletedAt: null, status: 'COMPLETED' },
            }));
        });

        it('should filter by priority', async () => {
            await taskRepository.findAll({ priority: 'HIGH' as any });

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { deletedAt: null, priority: 'HIGH' },
            }));
        });

        it('should search by description', async () => {
            await taskRepository.findAll({ search: 'test' });

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    deletedAt: null,
                    description: { contains: 'test' },
                },
            }));
        });
    });

    describe('findById', () => {
        it('should return a task by id if found and not deleted', async () => {
            (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

            const result = await taskRepository.findById('task-123');

            expect(prisma.task.findFirst).toHaveBeenCalledWith({
                where: { id: 'task-123', deletedAt: null },
            });
            expect(result).toEqual(mockTask);
        });

        it('should return null if task not found', async () => {
            (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await taskRepository.findById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a task', async () => {
            const updatedTask = { ...mockTask, title: 'Updated Title' };
            (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await taskRepository.update('task-123', { title: 'Updated Title' });

            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 'task-123' },
                data: expect.objectContaining({
                    title: 'Updated Title',
                    updatedAt: expect.any(Date),
                }),
            });
            expect(result).toEqual(updatedTask);
        });
    });

    describe('softDelete', () => {
        it('should soft delete a task', async () => {
            const deletedTask = { ...mockTask, deletedAt: mockDate };
            (prisma.task.update as jest.Mock).mockResolvedValue(deletedTask);

            const result = await taskRepository.softDelete('task-123');

            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 'task-123' },
                data: { deletedAt: expect.any(Date) },
            });
            expect(result).toEqual(deletedTask);
        });
    });
});
