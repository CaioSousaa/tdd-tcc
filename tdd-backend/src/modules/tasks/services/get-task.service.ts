import { TaskRepositoryPort } from '../port/task.repository.port';
import mongoose from 'mongoose';

export class GetTaskService {
  constructor(private readonly taskRepository: TaskRepositoryPort) { }

  async execute(taskId: string, ownerId: string) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.owner.toString() !== ownerId) {
      throw new Error('Forbidden');
    }

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.map((tag: any) => ({
        id: tag._id.toString(),
        name: tag.name,
        color: tag.color
      })),
      alert: task.alert,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }
}
