import { NotificationModel, INotification } from '../../../../infra/mongo/schemas/notification.schema';
import { NotificationRepositoryPort } from '../../port/notification.repository.port';

export class NotificationRepository implements NotificationRepositoryPort {
  async create(data: Partial<INotification>): Promise<INotification> {
    return await NotificationModel.create(data);
  }

  async findByTask(taskId: string): Promise<INotification | null> {
    return await NotificationModel.findOne({ task: taskId });
  }

  async listByUser(userId: string): Promise<INotification[]> {
    return await NotificationModel.find({ owner: userId }).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<INotification>): Promise<INotification | null> {
    return await NotificationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string): Promise<INotification | null> {
    return await NotificationModel.findById(id);
  }
}
