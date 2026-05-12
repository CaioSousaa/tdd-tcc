import { Router } from 'express';
import { makeCreateTaskController } from '../modules/tasks/factories/create-task.factory';
import { authMiddleware } from '../shared/http/authMiddleware';

const taskRoutes = Router();
const taskController = makeCreateTaskController();

taskRoutes.post('/', authMiddleware, (req, res) => taskController.create(req, res));
taskRoutes.get('/', authMiddleware, (req, res) => taskController.list(req, res));
taskRoutes.get('/:id', authMiddleware, (req, res) => taskController.show(req, res));
taskRoutes.put('/:id', authMiddleware, (req, res) => taskController.update(req, res));
taskRoutes.delete('/:id', authMiddleware, (req, res) => taskController.delete(req, res));

export { taskRoutes };
