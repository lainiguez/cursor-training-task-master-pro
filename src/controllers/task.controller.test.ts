import { Request, Response, NextFunction } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from '../services/task.service';
import { z } from 'zod';

// Mock TaskService
jest.mock('../services/task.service');

describe('TaskController', () => {
    let taskController: TaskController;
    let taskServiceMock: jest.Mocked<TaskService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        // Setup mocks
        taskServiceMock = new TaskService() as jest.Mocked<TaskService>;
        (TaskService as jest.Mock).mockImplementation(() => taskServiceMock);

        taskController = new TaskController();

        mockRequest = {
            query: {},
        };
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        mockResponse = {
            status: statusMock as unknown as any,
            json: jsonMock,
        };
        nextFunction = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a task and return 201', async () => {
            const mockTask = { id: 'task-1', title: 'Task 1' };
            mockRequest.body = { title: 'Task 1' };
            // @ts-ignore
            taskServiceMock.createTask.mockResolvedValue(mockTask);

            await taskController.create(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(taskServiceMock.createTask).toHaveBeenCalledWith({ title: 'Task 1' });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockTask });
        });

        it('should handle ZodError and return 400', async () => {
            const zodError = new z.ZodError([{ path: ['title'], message: 'Required', code: 'custom' }]);
            taskServiceMock.createTask.mockRejectedValue(zodError);
            mockRequest.body = {};

            await taskController.create(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ success: false, message: zodError.issues });
        });

        it('should pass other errors to next middleware', async () => {
            const error = new Error('Service error');
            taskServiceMock.createTask.mockRejectedValue(error);

            await taskController.create(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('getAll', () => {
        it('should get all tasks and return 200', async () => {
            const mockTasks = [{ id: 'task-1' }];
            // @ts-ignore
            taskServiceMock.getTasks.mockResolvedValue(mockTasks);
            mockRequest.query = { status: 'PENDING' };

            await taskController.getAll(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(taskServiceMock.getTasks).toHaveBeenCalledWith({
                status: 'PENDING',
                priority: undefined,
                search: undefined,
            });
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockTasks });
        });

        it('should pass errors to next middleware', async () => {
            const error = new Error('Service error');
            taskServiceMock.getTasks.mockRejectedValue(error);

            await taskController.getAll(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('updateKeyDetails', () => {
        it('should update task details and return 200', async () => {
            const mockTask = { id: 'task-1', status: 'DONE' };
            mockRequest.params = { id: 'task-1' };
            mockRequest.body = { status: 'DONE' };
            // @ts-ignore
            taskServiceMock.updateTaskStatusOrPriority.mockResolvedValue(mockTask);

            await taskController.updateKeyDetails(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(taskServiceMock.updateTaskStatusOrPriority).toHaveBeenCalledWith('task-1', { status: 'DONE' });
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockTask });
        });

        it('should handle ZodError and return 400', async () => {
            const zodError = new z.ZodError([]);
            mockRequest.params = { id: 'task-1' };
            taskServiceMock.updateTaskStatusOrPriority.mockRejectedValue(zodError);

            await taskController.updateKeyDetails(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });

    describe('delete', () => {
        it('should delete task and return 200', async () => {
            mockRequest.params = { id: 'task-1' };
            taskServiceMock.deleteTask.mockResolvedValue();

            await taskController.delete(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(taskServiceMock.deleteTask).toHaveBeenCalledWith('task-1');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Task deleted successfully' });
        });

        it('should pass errors to next middleware', async () => {
            const error = new Error('Service error');
            mockRequest.params = { id: 'task-1' };
            taskServiceMock.deleteTask.mockRejectedValue(error);

            await taskController.delete(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });
});
