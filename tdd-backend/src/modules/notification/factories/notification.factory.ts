import { NotificationRepository } from '../infra/repository/notification.repository';
import { ListNotificationsService } from '../services/list-notifications.service';
import { UpdateNotificationService } from '../services/update-notification.service';
import { NotificationController } from '../infra/controllers/notification.controller';

export const makeNotificationController = (): NotificationController => {
  const notificationRepository = new NotificationRepository();
  const listNotificationsService = new ListNotificationsService(notificationRepository);
  const updateNotificationService = new UpdateNotificationService(notificationRepository);
  return new NotificationController(listNotificationsService, updateNotificationService);
};
