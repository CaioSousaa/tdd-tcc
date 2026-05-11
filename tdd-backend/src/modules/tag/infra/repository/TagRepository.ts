import { ITag, TagModel } from "../../../../infra/mongo/schemas/TagSchema";
import { CreateTagDTO } from "../../dto/CreateTagDTO";

export class TagRepository {
  async create(data: CreateTagDTO): Promise<ITag> {
    const tag = new TagModel(data);
    return await tag.save();
  }
}
