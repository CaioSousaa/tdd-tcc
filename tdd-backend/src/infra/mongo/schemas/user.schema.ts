import mongoose, { Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
