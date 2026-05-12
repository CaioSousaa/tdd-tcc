import request from "supertest";
import app from "../../../main/app";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { TagModel } from "../../../infra/mongo/schemas/tag.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";

describe("RF8 - Editar Tarefa", () => {
  let token: string;
  let userId: string;
  let taskId: string;
  let tagId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "RF8 User",
      email: "rf8@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string);

    const tag = await TagModel.create({
      name: "Backend",
      color: "#ffaa00",
      owner: userId,
    });
    tagId = String(tag._id);

    const task = await TaskModel.create({
      title: "Tarefa original",
      status: "todo",
      priority: "low",
      owner: userId,
    });
    taskId = String(task._id);
  });

  afterAll(async () => {
    await TaskModel.deleteMany({});
    await TagModel.deleteMany({});
    await UserModel.deleteMany({ email: "rf8@test.com" });
  });

  it("deve editar todos os campos da tarefa e retornar 200", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa editada",
        description: "Nova descrição",
        status: "in_progress",
        priority: "high",
        tags: [tagId],
        dueDate: "2025-12-31T00:00:00.000Z",
        alert: "2025-12-30T08:00:00.000Z",
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Tarefa editada");
    expect(res.body.description).toBe("Nova descrição");
    expect(res.body.status).toBe("in_progress");
    expect(res.body.priority).toBe("high");
    expect(res.body.tags).toHaveLength(1);
  });

  it("deve editar apenas um campo (edição parcial)", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
    expect(res.body.title).toBeDefined();
  });

  it("deve atualizar o campo updatedAt após edição", async () => {
    const before = await TaskModel.findById(taskId);

    await new Promise((r) => setTimeout(r, 10));

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Titulo novo" });

    expect(res.status).toBe(200);
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(
      new Date(before!.updatedAt).getTime()
    );
  });

  it("não deve alterar o campo owner mesmo que enviado no body", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Ownership check",
        owner: "507f1f77bcf86cd799439011",
      });

    expect(res.status).toBe(200);
    expect(String(res.body.owner)).toBe(userId);
  });

  it("não deve alterar o campo createdAt após edição", async () => {
    const before = await TaskModel.findById(taskId);

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "CreatedAt check", createdAt: new Date("2000-01-01") });

    expect(res.status).toBe(200);
    expect(res.body.createdAt).toBe(before!.createdAt.toISOString());
  });

  it("deve retornar 404 quando tarefa não existir", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Não existe" });

    expect(res.status).toBe(404);
  });

  it("deve retornar 403 quando tarefa pertencer a outro usuário", async () => {
    const otherUser = await UserModel.create({
      name: "Other",
      email: "other8@test.com",
      password: "hashed",
    });
    const otherTask = await TaskModel.create({
      title: "Tarefa alheia",
      status: "todo",
      priority: "low",
      owner: String(otherUser._id),
    });

    const res = await request(app)
      .put(`/tasks/${String(otherTask._id)}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tentativa de edição" });

    expect(res.status).toBe(403);

    await TaskModel.findByIdAndDelete(otherTask._id);
    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("deve retornar 400 quando status tiver valor inválido", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "pendente" });

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando priority tiver valor inválido", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: "critical" });

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando tag fornecida não pertencer ao usuário", async () => {
    const otherUser = await UserModel.create({
      name: "Tag Owner",
      email: "tagowner8@test.com",
      password: "hashed",
    });
    const foreignTag = await TagModel.create({
      name: "Tag Alheia",
      color: "#0000ff",
      owner: String(otherUser._id),
    });

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tags: [String(foreignTag._id)] });

    expect(res.status).toBe(400);

    await TagModel.findByIdAndDelete(foreignTag._id);
    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: "Sem auth" });

    expect(res.status).toBe(401);
  });
});
