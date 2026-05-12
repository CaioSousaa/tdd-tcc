import request from "supertest";
import app from "../../../main/app";
import { NotificationModel } from "../../../infra/mongo/schemas/notification.schema";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF14 - Marcar Notificação como Lida", () => {
  let token: string;
  let userId: string;
  let notificationId: string;

  beforeEach(async () => {
    // Cleanup collections before each test to ensure isolation
    await UserModel.deleteMany({});
    await TaskModel.deleteMany({});
    await NotificationModel.deleteMany({});

    const user = await UserModel.create({
      name: "RF14 User",
      email: "rf14@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);

    const task = await TaskModel.create({
      title: "Tarefa RF14",
      status: "todo",
      priority: "low",
      owner: userId,
    });

    const notification = await NotificationModel.create({
      owner: userId,
      task: String(task._id),
      message: "Alerta: tarefa 'Tarefa RF14' atingiu o horário configurado.",
      read: false,
    });
    notificationId = String(notification._id);
  });

  it("PUT /notifications/:id/read retorna 200 with a notificação atualizada", async () => {
    const res = await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({ read: true });

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("persiste read: true no banco após a requisição", async () => {
    await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({ read: true });

    const updated = await NotificationModel.findById(notificationId);
    expect(updated!.read).toBe(true);
  });

  it("operação é idempotente: marcar como lida novamente retorna 200", async () => {
    await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({ read: true });

    const res = await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({ read: true });

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("retorna 401 sem token de autenticação", async () => {
    const res = await request(app)
      .put(`/notifications/${notificationId}/read`)
      .send({ read: true });

    expect(res.status).toBe(401);
  });

  it("retorna 403 quando a notificação pertence a outro usuário", async () => {
    const otherUser = await UserModel.create({
      name: "Other",
      email: "rf14other@test.com",
      password: "hashed",
    });
    const otherToken = jwt.sign(
      { id: String(otherUser._id), sub: String(otherUser._id) },
      JWT_SECRET
    );

    const res = await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ read: true });

    expect(res.status).toBe(403);
  });

  it("retorna 404 quando a notificação não existe", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .put(`/notifications/${fakeId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({ read: true });

    expect(res.status).toBe(404);
  });

  it("GET /notifications retorna todas as notificações do usuário autenticado", async () => {
    const res = await request(app)
      .get("/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("message");
    expect(res.body[0]).toHaveProperty("read");
  });

  it("GET /notifications não retorna notificações de outros usuários", async () => {
    const otherUser = await UserModel.create({
      name: "Other2",
      email: "rf14other2@test.com",
      password: "hashed",
    });
    const task = await TaskModel.create({
      title: "Tarefa Alheia",
      status: "todo",
      priority: "low",
      owner: String(otherUser._id),
    });
    await NotificationModel.create({
      owner: String(otherUser._id),
      task: String(task._id),
      message: "Alheia",
      read: false,
    });

    const res = await request(app)
      .get("/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const ownerIds = res.body.map((n: any) => String(n.owner));
    expect(ownerIds.every((id: string) => id === userId)).toBe(true);
  });
});
