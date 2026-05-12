import { INotification } from '../../../infra/mongo/schemas/notification.schema';

export interface NotificationRepositoryPort {
  create(data: Partial<INotification>): Promise<INotification>;
  findByTask(taskId: string): Promise<INotification | null>;
  listByUser(userId: string): Promise<INotification[]>;
  update(id: string, data: Partial<INotification>): Promise<INotification | null>;
  findById(id: string): Promise<INotification | null>;
}
