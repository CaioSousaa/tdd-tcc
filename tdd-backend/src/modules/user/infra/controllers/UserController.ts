import { Request, Response } from 'express';
import { IUserService } from '../../port/IUserService';

export class UserController {
  constructor(private readonly service: IUserService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.create(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      const status = err.statusCode ?? 500;
      res.status(status).json({ error: err.message });
    }
  }
}
