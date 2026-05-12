import { Request, Response } from "express";
import { TagService } from "../../services/TagService";

export class TagController {
  constructor(private tagService: TagService) {}

  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const { name, color } = req.body;
      // userId is injected by authMiddleware
      const owner = req.userId;

      if (!owner) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!name || !color) {
        res.status(400).json({ error: "Name and color are required" });
        return;
      }

      const tag = await this.tagService.createTag({ name, color, owner });
      
      res.status(201).json(tag);
    } catch (error: any) {
      if (error.message === "Name and color are required") {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, color } = req.body;
      const ownerId = req.userId;

      if (!ownerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (id.length !== 24) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      const updatedTag = await this.tagService.updateTag(id, ownerId, { name, color });
      res.status(200).json(updatedTag);
    } catch (error: any) {
      if (error.message === "Tag not found") {
        res.status(404).json({ error: "Tag not found" });
      } else if (error.message === "Forbidden") {
        res.status(403).json({ error: "Forbidden" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.userId;

      if (!ownerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (id.length !== 24) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      await this.tagService.deleteTag(id, ownerId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Tag not found") {
        res.status(404).json({ error: "Tag not found" });
      } else if (error.message === "Forbidden") {
        res.status(403).json({ error: "Forbidden" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async listTags(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.userId;

      if (!ownerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const tags = await this.tagService.listByOwner(ownerId);
      res.status(200).json(tags);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
