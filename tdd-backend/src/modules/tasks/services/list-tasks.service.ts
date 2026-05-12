import { TaskRepositoryPort } from '../port/task.repository.port';

export class ListTasksService {
  constructor(private readonly taskRepository: TaskRepositoryPort) { }

  async execute(ownerId: string, filters?: { priority?: string, tags?: string[] }) {
    const tasks = await this.taskRepository.findByOwner(ownerId, filters);

    const priorityOrder: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3
    };

    tasks.sort((a, b) => {
      const pA = priorityOrder[a.priority] || 4;
      const pB = priorityOrder[b.priority] || 4;

      if (pA !== pB) {
        return pA - pB;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return 0;
    });

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
