import { TaskService } from './task.service';
import { TaskRepository } from '../repositories/task.repository';
import { AppError } from '../middlewares/error.middleware';

// Mock TaskRepository
jest.mock('../repositories/task.repository');

describe('TaskService', () => {
    let taskService: TaskService;
    let taskRepositoryMock: jest.Mocked<TaskRepository>;

    beforeEach(() => {
        taskRepositoryMock = new TaskRepository() as jest.Mocked<TaskRepository>;
        (TaskRepository as jest.Mock).mockImplementation(() => taskRepositoryMock);
        taskService = new TaskService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should throw an error if title is empty', async () => {
            const invalidData = {
                title: '',
                userId: 'user-123',
            };

            await expect(taskService.createTask(invalidData)).rejects.toThrow();
            // Zod throws ZodError, which might not be an AppError directly unless wrapped?
            // In controller we catch ZodError. Service throws ZodError. 
            // Test expects rejection.
        });

        it('should create a task successfully with valid data', async () => {
            const validData = {
                title: 'New Task',
                description: 'Do something',
                userId: 'user-123',
            };

            const mockTask = {
                id: 'task-1',
                title: 'New Task',
                description: 'Do something',
                status: 'PENDING',
                priority: 'MEDIUM',
                userId: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            // @ts-ignore
            taskRepositoryMock.create.mockResolvedValue(mockTask);

            const result = await taskService.createTask(validData);

            expect(taskRepositoryMock.create).toHaveBeenCalled();
            expect(result).toEqual(mockTask);
        });
    });
});
