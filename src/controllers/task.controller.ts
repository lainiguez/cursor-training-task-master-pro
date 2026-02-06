import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { z } from 'zod';

export class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
    }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const task = await this.taskService.createTask(req.body);
            res.status(201).json({ success: true, data: task });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, message: error.issues });
            } else {
                next(error);
            }
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, priority, search } = req.query;
            const tasks = await this.taskService.getTasks({
                status: typeof status === 'string' ? status : undefined,
                priority: typeof priority === 'string' ? priority : undefined,
                search: typeof search === 'string' ? search : undefined,
            });
            res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await this.taskService.getTaskById(id as string);
            if (!task) {
                res.status(404).json({ success: false, message: 'Task not found' });
                return;
            }
            res.status(200).json({ success: true, data: task });
        } catch (error) {
            next(error);
        }
    };

    updateKeyDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await this.taskService.updateTaskStatusOrPriority(id as string, req.body);
            res.status(200).json({ success: true, data: task });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, message: error.issues });
            } else {
                next(error);
            }
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.taskService.deleteTask(id as string);
            res.status(200).json({ success: true, message: 'Task deleted successfully' });
        } catch (error) {
            next(error);
        }
    };
}
