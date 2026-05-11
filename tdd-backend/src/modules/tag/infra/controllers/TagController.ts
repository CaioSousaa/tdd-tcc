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
}
