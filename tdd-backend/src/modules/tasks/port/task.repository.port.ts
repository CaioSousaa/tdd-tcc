import { CreateTaskDTO } from '../dto/create-task.dto';
import { UpdateTaskDTO } from '../dto/update-task.dto';

export interface TaskRepositoryPort {
  create(data: CreateTaskDTO): Promise<any>;
  findByOwner(ownerId: string): Promise<any[]>;
  findById(id: string): Promise<any>;
  update(id: string, data: Partial<UpdateTaskDTO>): Promise<any>;
  delete(id: string): Promise<void>;
}
