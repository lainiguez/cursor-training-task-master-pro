import express from 'express';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

const app = express();

app.use(express.json());

// Public routes (if any)
// ...

// Protected routes
app.use(authMiddleware);
app.use('/tasks', taskRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
