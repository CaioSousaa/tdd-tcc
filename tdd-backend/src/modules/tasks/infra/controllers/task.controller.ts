import { Request, Response } from 'express';
import { CreateTaskService } from '../../services/create-task.service';
import { ListTasksService } from '../../services/list-tasks.service';
import { UpdateTaskService } from '../../services/update-task.service';
import { DeleteTaskService } from '../../services/delete-task.service';

import { GetTaskService } from '../../services/get-task.service';

export class TaskController {
  constructor(
    private readonly createTaskService: CreateTaskService,
    private readonly listTasksService: ListTasksService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly deleteTaskService: DeleteTaskService,
    private readonly getTaskService: GetTaskService
  ) { }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.userId;
      if (!owner) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const task = await this.getTaskService.execute(id as string, owner as string);
      res.status(200).json(task);
    } catch (error: any) {
      if (error.message === 'Task not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Forbidden') {
        res.status(403).json({ error: error.message });
      } else if (error.message === 'Invalid task ID') {
        res.status(400).json({ error: error.message });
      } else {
        console.error("500 ERROR:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

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

      const { priority, tags } = req.query;

      const filters = {
        priority: priority as string,
        tags: tags ? (tags as string).split(',') : undefined
      };

      const tasks = await this.listTasksService.execute(owner, filters);
      res.status(200).json(tasks);
    } catch (error: any) {
      console.error("500 ERROR:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.userId;
      if (!owner) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const data = req.body;

      const task = await this.updateTaskService.execute(id as string, owner as string, data);
      res.status(200).json(task);
    } catch (error: any) {
      if (error.message === 'Task not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Forbidden') {
        res.status(403).json({ error: error.message });
      } else if (
        error.message === 'Title cannot be empty' ||
        error.message === 'Invalid status' ||
        error.message === 'Invalid priority' ||
        error.message === 'Invalid tag ID' ||
        error.message === 'Tag not found or does not belong to user' ||
        error.message === 'Invalid task ID'
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("500 ERROR:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.userId;
      if (!owner) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      await this.deleteTaskService.execute(id as string, owner as string);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Task not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Forbidden') {
        res.status(403).json({ error: error.message });
      } else if (error.message === 'Invalid task ID') {
        res.status(400).json({ error: error.message });
      } else {
        console.error("500 ERROR:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
