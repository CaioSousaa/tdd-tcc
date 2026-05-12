import { Router } from 'express';
import { makeNotificationController } from '../modules/notification/factories/notification.factory';
import { authMiddleware } from '../shared/http/authMiddleware';

const notificationRoutes = Router();
const notificationController = makeNotificationController();

notificationRoutes.get('/', authMiddleware, (req, res) => notificationController.list(req, res));
notificationRoutes.put('/:id/read', authMiddleware, (req, res) => notificationController.update(req, res));

export { notificationRoutes };
