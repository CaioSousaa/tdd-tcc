import { TaskRepositoryPort } from '../../port/task.repository.port';
import { CreateTaskDTO } from '../../dto/create-task.dto';
import { TaskModel } from '../../../../infra/mongo/schemas/task.schema';

export class TaskRepository implements TaskRepositoryPort {
  async create(data: CreateTaskDTO): Promise<any> {
    const task = new TaskModel(data);
    return await task.save();
  }

  async findByOwner(ownerId: string, filters?: { priority?: string, tags?: string[] }): Promise<any[]> {
    const query: any = { owner: ownerId };

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    return await TaskModel.find(query).populate('tags');
  }

  async findById(id: string): Promise<any> {
    return await TaskModel.findById(id).populate('tags');
  }

  async update(id: string, data: any): Promise<any> {
    return await TaskModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }
}
