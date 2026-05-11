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
}
