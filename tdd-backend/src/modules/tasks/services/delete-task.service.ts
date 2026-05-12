import { TaskRepositoryPort } from '../port/task.repository.port';
import mongoose from 'mongoose';

export class DeleteTaskService {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    if (String(task.owner) !== String(userId)) {
      throw new Error('Forbidden');
    }

    await this.taskRepository.delete(id);
  }
}
