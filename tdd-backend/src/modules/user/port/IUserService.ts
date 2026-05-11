import { CreateUserDTO, UserResponseDTO } from '../dto/CreateUserDTO';

export interface IUserService {
  create(data: CreateUserDTO): Promise<UserResponseDTO>;
}
