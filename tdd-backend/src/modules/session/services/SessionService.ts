import { ISessionService, ISessionResponse } from '../port/ISessionService';
import { CreateSessionDTO } from '../dto/CreateSessionDTO';
import { UserModel } from '../../../infra/mongo/schemas/UserSchema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../../config/jwt';

export class SessionService implements ISessionService {
  async execute(data: CreateSessionDTO): Promise<ISessionResponse> {
    const { email, password } = data;

    if (!email || !password) {
      const error: any = new Error('E-mail e senha são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      const error: any = new Error('E-mail ou senha inválidos');
      error.statusCode = 401;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const error: any = new Error('E-mail ou senha inválidos');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { sub: user._id.toString(), name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }
}
