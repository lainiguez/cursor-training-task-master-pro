import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();
const taskController = new TaskController();

router.post('/', taskController.create);
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.patch('/:id', taskController.updateKeyDetails);
router.delete('/:id', taskController.delete);

export default router;
