import request from "supertest";
import app from "../../../main/app";
import * as schedule from "node-schedule";
import { TaskModel } from "../../../infra/mongo/schemas/task.schema";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

jest.mock("node-schedule");

const mockScheduleJob = schedule.scheduleJob as jest.Mock;
const mockCancelJob = schedule.cancelJob as jest.Mock;

describe("RF12 - Agendamento de Alerta em Tarefa", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "RF12 User",
      email: "rf12@test.com",
      password: "hashed_password",
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);

    mockScheduleJob.mockReturnValue({ cancel: jest.fn() });
    mockCancelJob.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("agenda um job ao criar tarefa com alert no futuro", async () => {
    const alertDate = new Date(Date.now() + 60 * 60 * 1000);

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarefa com Alerta",
        status: "todo",
        priority: "high",
        alert: alertDate.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(mockScheduleJob).toHaveBeenCalledTimes(1);

    const [jobName, scheduledDate] = mockScheduleJob.mock.calls[0];
    expect(jobName).toBe(`alert_${res.body._id}`);
    expect(new Date(scheduledDate).getTime()).toBe(alertDate.getTime());
  });

  it("não agenda job ao criar tarefa sem o campo alert", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Sem Alerta", status: "todo", priority: "low" });

    expect(res.status).toBe(201);
    expect(mockScheduleJob).not.toHaveBeenCalled();
  });

  it("não agenda job quando o alert está no passado", async () => {
    const pastDate = new Date(Date.now() - 5000);

    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Alerta Passado",
        status: "todo",
        priority: "low",
        alert: pastDate.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(mockScheduleJob).not.toHaveBeenCalled();
  });

  it("ao atualizar alert, cancela o job anterior e agenda um novo", async () => {
    const task = await TaskModel.create({
      title: "Tarefa com Alert",
      status: "todo",
      priority: "low",
      owner: userId,
      alert: new Date(Date.now() + 3600000),
    });
    const taskId = String(task._id);
    jest.clearAllMocks();
    mockScheduleJob.mockReturnValue({ cancel: jest.fn() });

    const newAlertDate = new Date(Date.now() + 7200000);

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ alert: newAlertDate.toISOString() });

    expect(res.status).toBe(200);
    expect(mockCancelJob).toHaveBeenCalledWith(`alert_${taskId}`);
    expect(mockScheduleJob).toHaveBeenCalledTimes(1);

    const [, scheduledDate] = mockScheduleJob.mock.calls[0];
    expect(new Date(scheduledDate).getTime()).toBe(newAlertDate.getTime());
  });

  it("ao remover alert (null), cancela o job existente e não agenda novo", async () => {
    const task = await TaskModel.create({
      title: "Remover Alert",
      status: "todo",
      priority: "low",
      owner: userId,
      alert: new Date(Date.now() + 3600000),
    });
    const taskId = String(task._id);
    jest.clearAllMocks();

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ alert: null });

    expect(res.status).toBe(200);
    expect(mockCancelJob).toHaveBeenCalledWith(`alert_${taskId}`);
    expect(mockScheduleJob).not.toHaveBeenCalled();
  });

  it("ao atualizar campos que não são alert, não interfere no agendamento", async () => {
    const task = await TaskModel.create({
      title: "Sem Mudança de Alert",
      status: "todo",
      priority: "low",
      owner: userId,
    });
    const taskId = String(task._id);
    jest.clearAllMocks();

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Novo Título" });

    expect(res.status).toBe(200);
    expect(mockScheduleJob).not.toHaveBeenCalled();
    expect(mockCancelJob).not.toHaveBeenCalled();
  });
});
