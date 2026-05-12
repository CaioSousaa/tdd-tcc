import request from "supertest";
import app from "../../../main/app";
import mongoose from "mongoose";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF10 - Listagem de Tarefas em Colunas", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "RF10 User",
      email: "rf10@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);
  });

  afterEach(async () => {
    await TaskModel.deleteMany({});
    await UserModel.deleteMany({ email: "rf10@test.com" });
  });

  it("GET /tasks retorna 200 com lista de tarefas do usuário autenticado", async () => {
    await TaskModel.create({ title: "T1", status: "todo", priority: "low", owner: userId });

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty("title", "T1");
  });

  it("retorna lista vazia quando usuário não tem tarefas", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /tasks sem token retorna 401", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(401);
  });

  it("não retorna tarefas de outros usuários", async () => {
    const otherUser = await UserModel.create({
      name: "Other",
      email: "rf10other@test.com",
      password: "hashed",
    });
    await TaskModel.create({ title: "Alheia", status: "todo", priority: "low", owner: String(otherUser._id) });

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);

    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("retorna tarefas ordenadas por prioridade: high → medium → low", async () => {
    await TaskModel.insertMany([
      { title: "Baixa", status: "todo", priority: "low", owner: userId, dueDate: new Date("2026-01-01") },
      { title: "Alta", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-01-01") },
      { title: "Média", status: "todo", priority: "medium", owner: userId, dueDate: new Date("2026-01-01") },
    ]);

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].priority).toBe("high");
    expect(res.body[1].priority).toBe("medium");
    expect(res.body[2].priority).toBe("low");
  });

  it("ordena por dueDate ascendente dentro do mesmo grupo de prioridade", async () => {
    await TaskModel.insertMany([
      { title: "Tarde", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-12-31") },
      { title: "Cedo", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-01-01") },
    ]);

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Cedo");
    expect(res.body[1].title).toBe("Tarde");
  });

  it("posiciona tarefas sem dueDate ao final do grupo de prioridade", async () => {
    await TaskModel.insertMany([
      { title: "Sem Vencimento", status: "todo", priority: "high", owner: userId },
      { title: "Com Vencimento", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-06-01") },
    ]);

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Com Vencimento");
    expect(res.body[1].title).toBe("Sem Vencimento");
  });

  it("cada tarefa retornada contém os campos esperados (incluindo tags populadas)", async () => {
    await TaskModel.create({ title: "Completa", status: "in_progress", priority: "medium", owner: userId, tags: [] });

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const task = res.body[0];
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("priority");
    expect(task).toHaveProperty("tags");
    expect(task).toHaveProperty("createdAt");
    expect(Array.isArray(task.tags)).toBe(true);
  });
});
