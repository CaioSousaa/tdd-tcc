import { TaskRepositoryPort } from '../../port/task.repository.port';
import { CreateTaskDTO } from '../../dto/create-task.dto';
import { TaskModel } from '../../../../infra/mongo/schemas/task.schema';

export class TaskRepository implements TaskRepositoryPort {
  async create(data: CreateTaskDTO): Promise<any> {
    const task = new TaskModel(data);
    return await task.save();
  }

  async findByOwner(ownerId: string): Promise<any[]> {
    return await TaskModel.find({ owner: ownerId }).populate('tags');
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
