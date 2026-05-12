import { ITag, TagModel } from "../../../../infra/mongo/schemas/tag.schema";
import { CreateTagDTO } from "../../dto/CreateTagDTO";

export class TagRepository {
  async create(data: CreateTagDTO): Promise<ITag> {
    const tag = new TagModel(data);
    return await tag.save();
  }

  async findById(id: string): Promise<ITag | null> {
    return await TagModel.findById(id);
  }

  async update(id: string, data: Partial<{ name: string; color: string }>): Promise<ITag | null> {
    return await TagModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await TagModel.findByIdAndDelete(id);
  }

  async findByOwner(ownerId: string): Promise<ITag[]> {
    return await TagModel.find({ owner: ownerId });
  }
}
