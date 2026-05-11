import { UserModel, IUserDocument } from '../../../../infra/mongo/schemas/UserSchema';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email });
  }

  async create(data: { name: string; email: string; password: string }): Promise<IUserDocument> {
    return UserModel.create(data);
  }
}
