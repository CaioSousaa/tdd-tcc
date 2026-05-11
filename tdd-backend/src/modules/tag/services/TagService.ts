import { ITagService } from "../port/ITagService";
import { CreateTagDTO } from "../dto/CreateTagDTO";
import { TagRepository } from "../infra/repository/TagRepository";

export class TagService implements ITagService {
  constructor(private tagRepository: TagRepository) {}

  async createTag(data: CreateTagDTO) {
    if (!data.name || !data.color) {
      throw new Error("Name and color are required");
    }

    const tag = await this.tagRepository.create(data);

    return {
      id: tag._id.toString(),
      name: tag.name,
      color: tag.color,
      owner: tag.owner.toString(),
      createdAt: tag.createdAt,
    };
  }
}
