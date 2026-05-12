import { NotificationRepositoryPort } from '../port/notification.repository.port';

export class ListNotificationsService {
  constructor(private notificationRepository: NotificationRepositoryPort) {}

  async execute(userId: string) {
    return await this.notificationRepository.listByUser(userId);
  }
}
