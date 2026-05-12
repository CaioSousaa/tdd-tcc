import { NotificationRepositoryPort } from '../port/notification.repository.port';

export class CreateNotificationService {
  constructor(private notificationRepository: NotificationRepositoryPort) {}

  async execute(taskId: string, ownerId: string, title: string) {
    const existingNotification = await this.notificationRepository.findByTask(taskId);

    if (existingNotification) {
      return existingNotification;
    }

    return await this.notificationRepository.create({
      task: taskId as any,
      owner: ownerId as any,
      message: `Alerta: tarefa '${title}' atingiu o horário configurado.`,
      read: false,
    });
  }
}
