import { Router, Request, Response } from 'express';
import { makeSessionController } from '../modules/session/factories/SessionFactory';

export const sessionRoutes = Router();

sessionRoutes.post('/sessions', (req: Request, res: Response) =>
  makeSessionController().create(req, res)
);
