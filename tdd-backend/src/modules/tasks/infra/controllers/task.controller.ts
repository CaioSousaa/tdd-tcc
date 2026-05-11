import { Request, Response } from 'express';
import { CreateTaskService } from '../../services/create-task.service';
import { ListTasksService } from '../../services/list-tasks.service';

export class TaskController {
  constructor(
    private readonly createTaskService: CreateTaskService,
    private readonly listTasksService: ListTasksService
  ) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.userId; // From auth middleware
      if (!owner) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, description, status, priority, tags, dueDate, alert } = req.body;

      const task = await this.createTaskService.execute({
        title,
        description,
        status,
        priority,
        tags,
        dueDate,
        alert,
        owner,
      });

      res.status(201).json(task);
    } catch (error: any) {
      if (
        error.message === 'Title is required' ||
        error.message === 'Invalid status' ||
        error.message === 'Invalid priority' ||
        error.message === 'Invalid tag ID' ||
        error.message === 'Tag not found or does not belong to user'
      ) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
      } else {
        console.error("500 ERROR:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.userId;
      if (!owner) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tasks = await this.listTasksService.execute(owner);
      res.status(200).json(tasks);
    } catch (error: any) {
      console.error("500 ERROR:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
