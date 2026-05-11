import { TagRepository } from "../infra/repository/TagRepository";
import { TagService } from "../services/TagService";
import { TagController } from "../infra/controllers/TagController";

export const makeTagController = (): TagController => {
  const tagRepository = new TagRepository();
  const tagService = new TagService(tagRepository);
  return new TagController(tagService);
};
