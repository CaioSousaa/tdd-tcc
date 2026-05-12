import { CreateUserDTO, UserResponseDTO } from '../dto/CreateUserDTO';

export interface IUserService {
  create(data: CreateUserDTO): Promise<UserResponseDTO>;
  getProfile(id: string): Promise<UserResponseDTO>;
  update(id: string, data: { name?: string; password?: string }): Promise<UserResponseDTO>;
}
