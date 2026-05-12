import * as schedule from 'node-schedule';
import { CreateNotificationService } from '../../notification/services/create-notification.service';

export class ScheduleAlertService {
  constructor(private createNotificationService: CreateNotificationService) {}

  schedule(taskId: string, taskTitle: string, ownerId: string, alertDate: Date): void {
    if (alertDate <= new Date()) {
      return;
    }

    const jobName = `alert_${taskId}`;
    
    // Cancel existing job with same name if it exists (though UpdateTaskService should handle this)
    schedule.cancelJob(jobName);

    schedule.scheduleJob(jobName, alertDate, async () => {
      await this.createNotificationService.execute(taskId, ownerId, taskTitle);
    });
  }

  cancel(taskId: string): void {
    schedule.cancelJob(`alert_${taskId}`);
  }
}
