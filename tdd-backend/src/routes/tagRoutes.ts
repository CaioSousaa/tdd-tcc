import { Router } from "express";
import { makeTagController } from "../modules/tag/factories/TagFactory";
import { authMiddleware } from "../shared/http/authMiddleware";

export const tagRoutes = Router();

const tagController = makeTagController();

tagRoutes.post("/tags", authMiddleware, (req, res) => tagController.createTag(req, res));
