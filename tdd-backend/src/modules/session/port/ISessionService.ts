import { CreateSessionDTO } from '../dto/CreateSessionDTO';

export interface ISessionResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ISessionService {
  execute(data: CreateSessionDTO): Promise<ISessionResponse>;
}
