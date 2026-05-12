import bcrypt from 'bcrypt';
import { IUserService } from '../port/IUserService';
import { CreateUserDTO, UserResponseDTO } from '../dto/CreateUserDTO';
import { UserRepository } from '../infra/repository/UserRepository';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService implements IUserService {
  constructor(private readonly repo: UserRepository) {}

  async create(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const { name, email, password } = dto;

    if (!name || !email || !password) {
      const err = new Error('name, email and password are required');
      (err as any).statusCode = 400;
      throw err;
    }

    if (!EMAIL_REGEX.test(email)) {
      const err = new Error('invalid email format');
      (err as any).statusCode = 400;
      throw err;
    }

    const existing = await this.repo.findByEmail(email);
    if (existing) {
      const err = new Error('email already registered');
      (err as any).statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.repo.create({ name, email, password: hashedPassword });

    return {
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async getProfile(id: string): Promise<UserResponseDTO> {
    const user = await this.repo.findById(id);
    if (!user) {
      const err = new Error('user not found');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, data: { name?: string; password?: string }): Promise<UserResponseDTO> {
    if (!data.name && !data.password) {
      const err = new Error('at least one field is required');
      (err as any).statusCode = 400;
      throw err;
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.repo.update(id, updateData);
    if (!user) {
      const err = new Error('user not found');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
