import request from "supertest";
import app from "../../../main/app";
import * as schedule from "node-schedule";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import { NotificationModel } from "../../../infra/mongo/schemas/notification.schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

jest.mock("node-schedule");

const mockScheduleJob = schedule.scheduleJob as jest.Mock;

describe("RF13 - Criação de Notificação por Alerta", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "RF13 User",
      email: "rf13@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const captureCallback = (): Promise<() => Promise<void>> => {
    return new Promise((resolve) => {
      mockScheduleJob.mockImplementation(
        (_name: string, _date: Date, callback: () => Promise<void>) => {
          resolve(callback);
          return { cancel: jest.fn() };
        }
      );
    });
  };

  it("cria uma Notification no banco ao disparar o callback do job", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa com Alerta",
        status: "todo",
        priority: "high",
        alert: new Date(Date.now() + 3600000).toISOString(),
      });

    expect(res.status).toBe(201);

    const callback = await callbackPromise;
    await callback();

    const notification = await NotificationModel.findOne({ task: res.body._id });
    expect(notification).not.toBeNull();
  });

  it("a Notification criada tem owner igual ao dono da tarefa", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Verifica Owner", status: "todo", priority: "low", alert: new Date(Date.now() + 3600000).toISOString() });

    const callback = await callbackPromise;
    await callback();

    const notification = await NotificationModel.findOne({ task: res.body._id });
    expect(String(notification!.owner)).toBe(userId);
  });

  it("a Notification criada tem read: false por padrão", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Verifica Read", status: "todo", priority: "medium", alert: new Date(Date.now() + 3600000).toISOString() });

    const callback = await callbackPromise;
    await callback();

    const notification = await NotificationModel.findOne({ task: res.body._id });
    expect(notification!.read).toBe(false);
  });

  it("a Notification criada contém o título da tarefa na mensagem", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Revisar PR urgente", status: "todo", priority: "high", alert: new Date(Date.now() + 3600000).toISOString() });

    const callback = await callbackPromise;
    await callback();

    const notification = await NotificationModel.findOne({ task: res.body._id });
    expect(notification!.message).toContain("Revisar PR urgente");
  });

  it("a Notification possui os campos obrigatórios do schema", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Campos Completos", status: "todo", priority: "low", alert: new Date(Date.now() + 3600000).toISOString() });

    const callback = await callbackPromise;
    await callback();

    const notification = await NotificationModel.findOne({ task: res.body._id });
    expect(notification).toMatchObject({
      read: false,
    });
    expect(notification!._id).toBeDefined();
    expect(notification!.owner).toBeDefined();
    expect(notification!.task).toBeDefined();
    expect(notification!.message).toBeDefined();
    expect(notification!.createdAt).toBeDefined();
  });

  it("não cria Notification duplicada se o callback for invocado mais de uma vez para a mesma tarefa", async () => {
    const callbackPromise = captureCallback();

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Idempotência", status: "todo", priority: "low", alert: new Date(Date.now() + 3600000).toISOString() });

    const callback = await callbackPromise;
    await callback();
    await callback();

    const count = await NotificationModel.countDocuments({ task: res.body._id });
    expect(count).toBe(1);
  });

  it("cria Notifications independentes para tarefas distintas", async () => {
    let cb1!: () => Promise<void>;
    let cb2!: () => Promise<void>;
    let callCount = 0;

    mockScheduleJob.mockImplementation((_name: string, _date: Date, callback: () => Promise<void>) => {
      callCount === 0 ? (cb1 = callback) : (cb2 = callback);
      callCount++;
      return { cancel: jest.fn() };
    });

    const res1 = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tarefa Alpha", status: "todo", priority: "low", alert: new Date(Date.now() + 3600000).toISOString() });

    const res2 = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tarefa Beta", status: "todo", priority: "low", alert: new Date(Date.now() + 7200000).toISOString() });

    await cb1();
    await cb2();

    const notif1 = await NotificationModel.findOne({ task: res1.body._id });
    const notif2 = await NotificationModel.findOne({ task: res2.body._id });

    expect(notif1!.message).toContain("Tarefa Alpha");
    expect(notif2!.message).toContain("Tarefa Beta");
    expect(String(notif1!.task)).not.toBe(String(notif2!.task));
  });
});
