import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  owner: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  alert?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], required: true, default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], required: true, default: 'low' },
    dueDate: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    alert: { type: Date },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITask>('Task', taskSchema);
