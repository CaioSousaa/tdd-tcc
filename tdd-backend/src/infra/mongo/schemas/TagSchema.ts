import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

export const TagModel = mongoose.model<ITag>('Tag', tagSchema);
