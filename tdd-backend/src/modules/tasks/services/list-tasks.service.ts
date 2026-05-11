import { TaskRepositoryPort } from '../port/task.repository.port';

export class ListTasksService {
  constructor(private readonly taskRepository: TaskRepositoryPort) { }

  async execute(ownerId: string) {
    const tasks = await this.taskRepository.findByOwner(ownerId);

    return tasks.map(task => ({
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
    }));
  }
}
