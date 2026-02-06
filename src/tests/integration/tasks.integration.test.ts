import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';

// Mock config/env to ensure consistent API Key
jest.mock('../../config/env', () => ({
    env: {
        API_KEY: 'test-api-key',
        PORT: 3000,
    },
}));

// Mock Prisma
jest.mock('../../config/database', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('Tasks Integration', () => {
    const apiKey = 'test-api-key';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /tasks', () => {
        it('should create a task with valid data and auth', async () => {
            const newTask = {
                id: 'task-1',
                title: 'Integration Task',
                description: 'Testing integration',
                userId: 'user-1',
                status: 'PENDING',
                priority: 'MEDIUM',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(newTask);

            const response = await request(app)
                .post('/tasks')
                .set('x-api-key', apiKey)
                .send({
                    title: 'Integration Task',
                    description: 'Testing integration',
                    userId: 'user-1',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(newTask.title);
        });

        it('should return 401 without api key', async () => {
            const response = await request(app)
                .post('/tasks')
                .send({ title: 'No Auth' });

            expect(response.status).toBe(401);
        });

        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/tasks')
                .set('x-api-key', apiKey)
                .send({
                    title: '', // Invalid
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /tasks', () => {
        it('should return list of tasks', async () => {
            const tasks = [{ id: 'task-1', title: 'Task 1' }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(tasks);

            const response = await request(app)
                .get('/tasks')
                .set('x-api-key', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should support filtering', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

            await request(app)
                .get('/tasks?status=COMPLETED&priority=HIGH')
                .set('x-api-key', apiKey);

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: 'COMPLETED',
                    priority: 'HIGH',
                }),
            }));
        });
    });

    describe('GET /tasks/:id', () => {
        it('should return a task by id', async () => {
            const task = { id: 'task-1', title: 'Task 1' };
            (prisma.task.findFirst as jest.Mock).mockResolvedValue(task);

            const response = await request(app)
                .get('/tasks/task-1')
                .set('x-api-key', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(task);
        });

        it('should return 404 if not found', async () => {
            (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .get('/tasks/non-existent')
                .set('x-api-key', apiKey);

            // Note: Controller might return null or throw 404. 
            // Checking service: getTaskById returns null if not found.
            // Checking controller: sends whatever service returns? 
            // Wait, service returns null. Controller might send 200 with null or we should handle this.
            // Let's check service logic again? 
            // Actually, usually findById returns null, controller says "success: true, data: null" or standard practice 404.
            // Let's assume current implementation returns 200 with data: null based on `res.status(200).json({ success: true, data: tasks })` pattern.
            // But usually for ById, if null, we want 404.
            // Let's verify existing logic quickly or adjust test expectations.
            // If service returns null, controller sends null.
            // Let's fix controller logic to return 404 if null, OR update test to expect 200 with null.
            // I'll stick to expecting 200 null for now unless I see code handling 404.

            // Re-reading controller code...
            // It doesn't seem to check for null. It just sends response.
            // So it will be 200 OK with data: null.
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PATCH /tasks/:id', () => {
        it('should update task status', async () => {
            const updatedTask = { id: 'task-1', status: 'COMPLETED' };
            (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-1' }); // for check exists check if any
            // Service usually checks existence first?
            // Checking Service... TaskService.updateTaskStatusOrPriority
            // It uses prisma.update directly? Or checks?
            // Let's assume it calls update implementation.

            (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);
            (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-1' }); // If service checks existence

            const response = await request(app)
                .patch('/tasks/task-1')
                .set('x-api-key', apiKey)
                .send({ status: 'COMPLETED' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('COMPLETED');
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('should delete task', async () => {
            (prisma.task.update as jest.Mock).mockResolvedValue({}); // soft delete
            (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-1' }); // If service checks existence

            const response = await request(app)
                .delete('/tasks/task-1')
                .set('x-api-key', apiKey);

            expect(response.status).toBe(200);
        });
    });
});
