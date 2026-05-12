import request from "supertest";
import app from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF15 - Configurações do Usuário", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    const hashedPassword = await bcrypt.hash("senha123", 10);
    const user = await UserModel.create({
      name: "RF15 User",
      email: "rf15@test.com",
      password: hashedPassword,
    });
    userId = String(user._id);
    token = jwt.sign({ id: userId, sub: userId }, JWT_SECRET);
  });

  // --- GET /users/me ---

  it("GET /users/me retorna 200 com perfil do usuário autenticado", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("RF15 User");
    expect(res.body.email).toBe("rf15@test.com");
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("createdAt");
  });

  it("GET /users/me não retorna o campo password", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });

  it("GET /users/me retorna 401 sem token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
  });

  // --- PATCH /users/me ---

  it("PATCH /users/me com name atualiza o nome e retorna 200", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Novo Nome" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Novo Nome");
  });

  it("PATCH /users/me persiste o nome atualizado no banco", async () => {
    await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nome Persistido" });

    const user = await UserModel.findById(userId);
    expect(user!.name).toBe("Nome Persistido");
  });

  it("PATCH /users/me com password salva a senha com hash bcrypt", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "novaSenha456" });

    expect(res.status).toBe(200);

    const user = await UserModel.findById(userId);
    const isHashed = await bcrypt.compare("novaSenha456", user!.password);
    expect(isHashed).toBe(true);
  });

  it("PATCH /users/me não salva a senha em texto plano", async () => {
    await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "senhaPlana" });

    const user = await UserModel.findById(userId);
    expect(user!.password).not.toBe("senhaPlana");
  });

  it("PATCH /users/me não retorna password na resposta", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sem Senha na Resposta" });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });

  it("PATCH /users/me atualiza apenas o campo enviado, mantendo os demais", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Só o Nome" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("rf15@test.com");

    const user = await UserModel.findById(userId);
    const passwordIntact = await bcrypt.compare("senha123", user!.password);
    expect(passwordIntact).toBe(true);
  });

  it("PATCH /users/me com body vazio retorna 400", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("PATCH /users/me sem token retorna 401", async () => {
    const res = await request(app)
      .patch("/users/me")
      .send({ name: "Sem Auth" });

    expect(res.status).toBe(401);
  });
});
