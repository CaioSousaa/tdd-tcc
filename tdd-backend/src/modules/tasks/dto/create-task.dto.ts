export interface CreateTaskDTO {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  dueDate?: string;
  alert?: string;
  owner: string;
}
