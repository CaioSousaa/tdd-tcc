import { Router, Request, Response } from 'express';
import { makeUserController } from '../modules/user/factories/UserFactory';
import { authMiddleware } from '../shared/http/authMiddleware';

export const userRoutes = Router();

userRoutes.post('/users', (req: Request, res: Response) =>
  makeUserController().create(req, res)
);

userRoutes.get('/users/me', authMiddleware, (req: Request, res: Response) =>
  makeUserController().me(req, res)
);

userRoutes.patch('/users/me', authMiddleware, (req: Request, res: Response) =>
  makeUserController().update(req, res)
);
