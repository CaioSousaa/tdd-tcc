import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { userRoutes } from '../routes/userRoutes';
import { sessionRoutes } from '../routes/sessionRoutes';
import { tagRoutes } from '../routes/tagRoutes';
import { taskRoutes } from '../routes/task.routes';
import { authMiddleware } from '../shared/http/authMiddleware';
import { TagModel } from '../infra/mongo/schemas/TagSchema';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(sessionRoutes);
app.use(tagRoutes);
app.use('/tasks', taskRoutes);

