import { TaskRepositoryPort } from '../port/task.repository.port';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { TagRepository } from '../../tag/infra/repository/TagRepository';
import mongoose from 'mongoose';

export class CreateTaskService {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly tagRepository: TagRepository
  ) {}

  async execute(data: CreateTaskDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!['todo', 'in_progress', 'done'].includes(data.status)) {
      throw new Error('Invalid status');
    }

    if (!['low', 'medium', 'high'].includes(data.priority)) {
      throw new Error('Invalid priority');
    }

    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        if (!mongoose.Types.ObjectId.isValid(tagId)) {
          throw new Error('Invalid tag ID');
        }
        const tag = await this.tagRepository.findById(tagId);
        if (!tag || String(tag.owner) !== String(data.owner)) {
          throw new Error('Tag not found or does not belong to user');
        }
      }
    }

    return await this.taskRepository.create(data);
  }
}
