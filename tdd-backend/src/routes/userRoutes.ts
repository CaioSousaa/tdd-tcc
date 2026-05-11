import { Router, Request, Response } from 'express';
import { makeUserController } from '../modules/user/factories/UserFactory';

export const userRoutes = Router();

userRoutes.post('/users', (req: Request, res: Response) =>
  makeUserController().create(req, res)
);
