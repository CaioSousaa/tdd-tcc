import mongoose, { Document } from 'mongoose';

export interface ITagDocument extends Document {
  name: string;
  color: string;
  owner: string;
}

const tagSchema = new mongoose.Schema<ITagDocument>(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    owner: { type: String, required: true },
  },
  { timestamps: true }
);

export const TagModel = mongoose.model<ITagDocument>('Tag', tagSchema);
