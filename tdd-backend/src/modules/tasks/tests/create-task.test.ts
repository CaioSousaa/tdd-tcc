import request from "supertest";
import app from "../../../main/app";
import mongoose from "mongoose";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { TagModel } from "../../../infra/mongo/schemas/tag.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../config/jwt";

describe("RF7 - Criar Tarefa", () => {
  let token: string;
  let userId: string;
  let tagId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "Test User",
      email: "rf7@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);

    const tag = await TagModel.create({
      name: "Urgente",
      color: "#ff0000",
      owner: userId,
    });
    tagId = String(tag._id);
  });

  afterAll(async () => {
    await TaskModel.deleteMany({});
    await TagModel.deleteMany({});
    await UserModel.deleteMany({ email: "rf7@test.com" });
  });

  it("deve criar uma tarefa com campos obrigatórios e retornar 201", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Implementar RF7",
        status: "todo",
        priority: "high",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Implementar RF7");
    expect(res.body.status).toBe("todo");
    expect(res.body.priority).toBe("high");
    expect(String(res.body.owner)).toBe(userId);
  });

  it("deve criar uma tarefa com todos os campos opcionais", async () => {

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa completa",
        description: "Descrição detalhada",
        status: "in_progress",
        priority: "medium",
        tags: [tagId],
        dueDate: "2025-12-31T00:00:00.000Z",
        alert: "2025-12-30T08:00:00.000Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Descrição detalhada");
    expect(res.body.tags).toHaveLength(1);
    expect(res.body.dueDate).toBeDefined();
    expect(res.body.alert).toBeDefined();
  });

  it("deve retornar 400 quando title estiver ausente", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "todo",
        priority: "low",
      });

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando status tiver valor inválido", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa inválida",
        status: "invalid_status",
        priority: "low",
      });

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando priority tiver valor inválido", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa inválida",
        status: "todo",
        priority: "critical",
      });

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando tag fornecida não pertencer ao usuário", async () => {
    const otherUser = await UserModel.create({
      name: "Other User",
      email: "other@test.com",
      password: "hashed",
    });
    const foreignTag = await TagModel.create({
      name: "Tag Alheia",
      color: "#00ff00",
      owner: String(otherUser._id),
    });

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa com tag alheia",
        status: "todo",
        priority: "low",
        tags: [String(foreignTag._id)],
      });

    expect(res.status).toBe(400);

    await TagModel.findByIdAndDelete(foreignTag._id);
    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("deve retornar 400 quando tag ID for inválido (não ObjectId)", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa com tag inválida",
        status: "todo",
        priority: "low",
        tags: ["id-invalido"],
      });

    expect(res.status).toBe(400);
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app).post("/tasks").send({
      title: "Sem auth",
      status: "todo",
      priority: "low",
    });

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 com token inválido", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", "Bearer token.invalido.aqui")
      .send({
        title: "Token inválido",
        status: "todo",
        priority: "low",
      });

    expect(res.status).toBe(401);
  });

  it("o owner da tarefa deve ser extraído do token, não do body", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Ownership test",
        status: "todo",
        priority: "low",
        owner: "507f1f77bcf86cd799439011", // deve ser ignorado
      });

    expect(res.status).toBe(201);
    expect(String(res.body.owner)).toBe(userId);
    expect(String(res.body.owner)).not.toBe("507f1f77bcf86cd799439011");
  });

  it("a tarefa criada deve ter createdAt e updatedAt", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Timestamps test",
        status: "done",
        priority: "medium",
      });

    expect(res.status).toBe(201);
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });
});
