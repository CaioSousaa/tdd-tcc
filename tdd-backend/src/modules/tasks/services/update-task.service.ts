import { TaskRepositoryPort } from '../port/task.repository.port';
import { UpdateTaskDTO } from '../dto/update-task.dto';
import { TagRepository } from '../../tag/infra/repository/TagRepository';
import mongoose from 'mongoose';

export class UpdateTaskService {
    constructor(
        private readonly taskRepository: TaskRepositoryPort,
        private readonly tagRepository: TagRepository
    ) { }

    async execute(id: string, userId: string, data: UpdateTaskDTO) {
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

        if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim() === '')) {
            throw new Error('Title cannot be empty');
        }

        if (data.status && !['todo', 'in_progress', 'done'].includes(data.status)) {
            throw new Error('Invalid status');
        }

        if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
            throw new Error('Invalid priority');
        }

        if (data.tags && data.tags.length > 0) {
            for (const tagId of data.tags) {
                if (!mongoose.Types.ObjectId.isValid(tagId)) {
                    throw new Error('Invalid tag ID');
                }
                const tag = await this.tagRepository.findById(tagId);
                if (!tag || String(tag.owner) !== String(userId)) {
                    throw new Error('Tag not found or does not belong to user');
                }
            }
        }

        // Ensure owner and createdAt are not updated
        const updateData = { ...data };
        delete (updateData as any).owner;
        delete (updateData as any).createdAt;

        return await this.taskRepository.update(id, updateData);
    }
}
