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

  async updateTag(id: string, ownerId: string, data: { name?: string; color?: string }) {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      throw new Error("Tag not found");
    }

    if (tag.owner.toString() !== ownerId) {
      throw new Error("Forbidden");
    }

    const updatedTag = await this.tagRepository.update(id, data);

    if (!updatedTag) {
      throw new Error("Tag not found");
    }

    return {
      id: updatedTag._id.toString(),
      name: updatedTag.name,
      color: updatedTag.color,
      owner: updatedTag.owner.toString(),
      createdAt: updatedTag.createdAt,
    };
  }

  async deleteTag(id: string, ownerId: string): Promise<void> {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      throw new Error("Tag not found");
    }

    if (tag.owner.toString() !== ownerId) {
      throw new Error("Forbidden");
    }

    await this.tagRepository.delete(id);
  }

  async listByOwner(ownerId: string) {
    const tags = await this.tagRepository.findByOwner(ownerId);
    
    return tags.map(tag => ({
      id: tag._id.toString(),
      name: tag.name,
      color: tag.color,
      owner: tag.owner.toString(),
      createdAt: tag.createdAt,
    }));
  }
}
