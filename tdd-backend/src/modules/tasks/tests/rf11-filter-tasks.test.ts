import request from "supertest";
import app from "../../../main/app";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { TagModel } from "../../../infra/mongo/schemas/tag.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF11 - Filtro de Tarefas", () => {
  let token: string;
  let userId: string;
  let tagId: string;
  let tag2Id: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "RF11 User",
      email: "rf11@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);

    const tag = await TagModel.create({ name: "Backend", color: "#ff0000", owner: userId });
    const tag2 = await TagModel.create({ name: "Frontend", color: "#00ff00", owner: userId });
    tagId = String(tag._id);
    tag2Id = String(tag2._id);
  });

  afterEach(async () => {
    await TaskModel.deleteMany({});
    await TagModel.deleteMany({});
    await UserModel.deleteMany({ email: "rf11@test.com" });
  });

  it("GET /tasks?priority=high retorna apenas tarefas de prioridade alta", async () => {
    await TaskModel.insertMany([
      { title: "Alta", status: "todo", priority: "high", owner: userId },
      { title: "Baixa", status: "todo", priority: "low", owner: userId },
      { title: "Média", status: "todo", priority: "medium", owner: userId },
    ]);

    const res = await request(app)
      .get("/tasks?priority=high")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].priority).toBe("high");
    expect(res.body[0].title).toBe("Alta");
  });

  it("GET /tasks?priority=low retorna apenas tarefas de prioridade baixa", async () => {
    await TaskModel.insertMany([
      { title: "Alta", status: "todo", priority: "high", owner: userId },
      { title: "Baixa", status: "done", priority: "low", owner: userId },
    ]);

    const res = await request(app)
      .get("/tasks?priority=low")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.every((t: any) => t.priority === "low")).toBe(true);
  });

  it("GET /tasks?tags=id filtra tarefas que contenham a tag informada", async () => {
    await TaskModel.create({ title: "Com Tag", status: "todo", priority: "low", owner: userId, tags: [tagId] });
    await TaskModel.create({ title: "Sem Tag", status: "todo", priority: "low", owner: userId, tags: [] });

    const res = await request(app)
      .get(`/tasks?tags=${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Com Tag");
  });

  it("GET /tasks?tags=id1,id2 retorna tarefas com ao menos uma das tags", async () => {
    await TaskModel.create({ title: "Tag1 Only", status: "todo", priority: "low", owner: userId, tags: [tagId] });
    await TaskModel.create({ title: "Tag2 Only", status: "todo", priority: "low", owner: userId, tags: [tag2Id] });
    await TaskModel.create({ title: "No Tags", status: "todo", priority: "low", owner: userId, tags: [] });

    const res = await request(app)
      .get(`/tasks?tags=${tagId},${tag2Id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t: any) => t.title)).not.toContain("No Tags");
  });

  it("combina filtros de priority e tags aplicando ambos simultaneamente", async () => {
    await TaskModel.create({ title: "Alta com Tag", status: "todo", priority: "high", owner: userId, tags: [tagId] });
    await TaskModel.create({ title: "Alta sem Tag", status: "todo", priority: "high", owner: userId, tags: [] });
    await TaskModel.create({ title: "Baixa com Tag", status: "todo", priority: "low", owner: userId, tags: [tagId] });

    const res = await request(app)
      .get(`/tasks?priority=high&tags=${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Alta com Tag");
  });

  it("GET /tasks sem filtros retorna todas as tarefas do usuário", async () => {
    await TaskModel.insertMany([
      { title: "T1", status: "todo", priority: "high", owner: userId },
      { title: "T2", status: "done", priority: "low", owner: userId },
      { title: "T3", status: "in_progress", priority: "medium", owner: userId },
    ]);

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it("filtros não expõem tarefas de outros usuários", async () => {
    const otherUser = await UserModel.create({
      name: "Other",
      email: "rf11other@test.com",
      password: "hashed",
    });
    await TaskModel.create({
      title: "Alheia Alta",
      status: "todo",
      priority: "high",
      owner: String(otherUser._id),
      tags: [tagId],
    });

    const res = await request(app)
      .get(`/tasks?priority=high&tags=${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);

    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("retorna lista vazia quando nenhuma tarefa satisfaz o filtro", async () => {
    await TaskModel.create({ title: "Baixa", status: "todo", priority: "low", owner: userId });

    const res = await request(app)
      .get("/tasks?priority=high")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("resultado filtrado mantém o ordenamento por prioridade e dueDate", async () => {
    await TaskModel.insertMany([
      { title: "Alta Tarde", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-12-31"), tags: [tagId] },
      { title: "Alta Cedo", status: "todo", priority: "high", owner: userId, dueDate: new Date("2026-01-01"), tags: [tagId] },
    ]);

    const res = await request(app)
      .get(`/tasks?priority=high&tags=${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Alta Cedo");
    expect(res.body[1].title).toBe("Alta Tarde");
  });
});
