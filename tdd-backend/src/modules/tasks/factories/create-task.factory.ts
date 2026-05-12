import { TaskController } from '../infra/controllers/task.controller';
import { CreateTaskService } from '../services/create-task.service';
import { ListTasksService } from '../services/list-tasks.service';
import { UpdateTaskService } from '../services/update-task.service';
import { DeleteTaskService } from '../services/delete-task.service';
import { GetTaskService } from '../services/get-task.service';
import { TaskRepository } from '../infra/repository/task.repository';
import { TagRepository } from '../../tag/infra/repository/TagRepository';
import { ScheduleAlertService } from '../services/schedule-alert.service';
import { NotificationRepository } from '../../notification/infra/repository/notification.repository';
import { CreateNotificationService } from '../../notification/services/create-notification.service';

const notificationRepository = new NotificationRepository();
const createNotificationService = new CreateNotificationService(notificationRepository);
const scheduleAlertService = new ScheduleAlertService(createNotificationService);

export const makeCreateTaskController = (): TaskController => {
  const taskRepository = new TaskRepository();
  const tagRepository = new TagRepository();
  const createTaskService = new CreateTaskService(taskRepository, tagRepository, scheduleAlertService);
  const listTasksService = new ListTasksService(taskRepository);
  const updateTaskService = new UpdateTaskService(taskRepository, tagRepository, scheduleAlertService);
  const deleteTaskService = new DeleteTaskService(taskRepository);
  const getTaskService = new GetTaskService(taskRepository);
  return new TaskController(createTaskService, listTasksService, updateTaskService, deleteTaskService, getTaskService);
};
