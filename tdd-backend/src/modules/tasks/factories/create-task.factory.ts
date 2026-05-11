import { TaskController } from '../infra/controllers/task.controller';
import { CreateTaskService } from '../services/create-task.service';
import { ListTasksService } from '../services/list-tasks.service';
import { TaskRepository } from '../infra/repository/task.repository';
import { TagRepository } from '../../tag/infra/repository/TagRepository';

export const makeCreateTaskController = (): TaskController => {
  const taskRepository = new TaskRepository();
  const tagRepository = new TagRepository();
  const createTaskService = new CreateTaskService(taskRepository, tagRepository);
  const listTasksService = new ListTasksService(taskRepository);
  return new TaskController(createTaskService, listTasksService);
};
