import { CreateTagDTO } from "../dto/CreateTagDTO";
import { ITag } from "../../../infra/mongo/schemas/tag.schema";

export interface ITagService {
  createTag(data: CreateTagDTO): Promise<{
    id: string;
    name: string;
    color: string;
    owner: string;
    createdAt: Date;
  }>;

  updateTag(id: string, ownerId: string, data: { name?: string; color?: string }): Promise<{
    id: string;
    name: string;
    color: string;
    owner: string;
    createdAt: Date;
  }>;

  deleteTag(id: string, ownerId: string): Promise<void>;

  listByOwner(ownerId: string): Promise<Array<{
    id: string;
    name: string;
    color: string;
    owner: string;
    createdAt: Date;
  }>>;
}
