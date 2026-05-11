import { CreateTagDTO } from "../dto/CreateTagDTO";
import { ITag } from "../../../infra/mongo/schemas/TagSchema";

export interface ITagService {
  createTag(data: CreateTagDTO): Promise<{
    id: string;
    name: string;
    color: string;
    owner: string;
    createdAt: Date;
  }>;
}
