import { UserModel, IUserDocument } from '../../../../infra/mongo/schemas/user.schema';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email });
  }

  async create(data: { name: string; email: string; password: string }): Promise<IUserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id);
  }

  async update(id: string, data: Partial<{ name: string; password: string }>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }
}
