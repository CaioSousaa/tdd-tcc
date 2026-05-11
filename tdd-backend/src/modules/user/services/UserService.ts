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
}
