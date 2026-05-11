import { Router } from "express";
import { makeTagController } from "../modules/tag/factories/TagFactory";
import { authMiddleware } from "../shared/http/authMiddleware";

export const tagRoutes = Router();

const tagController = makeTagController();

tagRoutes.post("/tags", authMiddleware, (req, res) => tagController.createTag(req, res));
tagRoutes.put("/tags/:id", authMiddleware, (req, res) => tagController.updateTag(req, res));
tagRoutes.delete("/tags/:id", authMiddleware, (req, res) => tagController.deleteTag(req, res));
tagRoutes.get("/tags", authMiddleware, (req, res) => tagController.listTags(req, res));
