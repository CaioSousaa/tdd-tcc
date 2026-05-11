import { CreateTaskDTO } from '../dto/create-task.dto';

export interface TaskRepositoryPort {
  create(data: CreateTaskDTO): Promise<any>;
  findByOwner(ownerId: string): Promise<any[]>;
}
