import { UserRepository } from '../infra/repository/UserRepository';
import { UserService } from '../services/UserService';
import { UserController } from '../infra/controllers/UserController';

export function makeUserController(): UserController {
  const repo = new UserRepository();
  const service = new UserService(repo);
  return new UserController(service);
}
