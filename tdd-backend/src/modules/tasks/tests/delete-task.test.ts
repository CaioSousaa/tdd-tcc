import request from "supertest";
import app from "../../../main/app";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";

describe("RF9 - Excluir Tarefa", () => {
  let token: string;
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    const user = await UserModel.create({
      name: "RF9 User",
      email: "rf9@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string);
  });

  beforeEach(async () => {
    const task = await TaskModel.create({
      title: "Tarefa a excluir",
      status: "todo",
      priority: "low",
      owner: userId,
    });
    taskId = String(task._id);
  });

  afterAll(async () => {
    await TaskModel.deleteMany({});
    await UserModel.deleteMany({ email: "rf9@test.com" });
  });

  it("deve excluir a tarefa e retornar 204 sem body", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("deve remover a tarefa permanentemente do banco", async () => {
    await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    const found = await TaskModel.findById(taskId);
    expect(found).toBeNull();
  });

  it("deve retornar 404 quando tarefa não existir", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .delete(`/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 ao tentar excluir a mesma tarefa duas vezes", async () => {
    await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("deve retornar 403 quando tarefa pertencer a outro usuário", async () => {
    const otherUser = await UserModel.create({
      name: "Other",
      email: "other9@test.com",
      password: "hashed",
    });
    const otherTask = await TaskModel.create({
      title: "Tarefa alheia",
      status: "todo",
      priority: "low",
      owner: String(otherUser._id),
    });

    const res = await request(app)
      .delete(`/tasks/${String(otherTask._id)}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);

    const stillExists = await TaskModel.findById(otherTask._id);
    expect(stillExists).not.toBeNull();

    await TaskModel.findByIdAndDelete(otherTask._id);
    await UserModel.findByIdAndDelete(otherUser._id);
  });

  it("deve retornar 400 quando o id não for um ObjectId válido", async () => {
    const res = await request(app)
      .delete("/tasks/id-invalido")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 com token inválido", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", "Bearer token.invalido.aqui");

    expect(res.status).toBe(401);
  });
});
