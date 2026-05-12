import { Request, Response } from 'express';
import { ListNotificationsService } from '../../services/list-notifications.service';
import { UpdateNotificationService } from '../../services/update-notification.service';

export class NotificationController {
  constructor(
    private listNotificationsService: ListNotificationsService,
    private updateNotificationService: UpdateNotificationService
  ) {}

  async list(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const notifications = await this.listNotificationsService.execute(userId);
      return res.json(notifications);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { read } = req.body;

      const notification = await this.updateNotificationService.execute(id as string, userId, { read });
      return res.json(notification);
    } catch (err: any) {
      const status = err.message === 'Forbidden' ? 403 : 404;
      return res.status(status).json({ error: err.message });
    }
  }
}
