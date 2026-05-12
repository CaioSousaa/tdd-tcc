import { NotificationRepositoryPort } from '../port/notification.repository.port';

export class UpdateNotificationService {
  constructor(private notificationRepository: NotificationRepositoryPort) {}

  async execute(id: string, userId: string, data: { read: boolean }) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (String(notification.owner) !== String(userId)) {
      throw new Error('Forbidden');
    }

    return await this.notificationRepository.update(id, data);
  }
}
