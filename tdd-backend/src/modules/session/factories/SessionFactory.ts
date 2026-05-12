import { SessionController } from '../infra/controllers/SessionController';
import { SessionService } from '../services/SessionService';

export const makeSessionController = (): SessionController => {
  const sessionService = new SessionService();
  return new SessionController(sessionService);
};
