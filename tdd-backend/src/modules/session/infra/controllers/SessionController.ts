import { Request, Response } from 'express';
import { ISessionService } from '../../port/ISessionService';

export class SessionController {
  constructor(private readonly sessionService: ISessionService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.sessionService.execute(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}
