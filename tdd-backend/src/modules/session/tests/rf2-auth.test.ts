import request from "supertest";
import app from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import bcrypt from "bcrypt";

describe("RF2 - Autenticação de Usuário", () => {

  beforeEach(async () => {
    await UserModel.create({
      name: "João Silva",
      email: "joao@email.com",
      password: await bcrypt.hash("senha123", 10),
    });
  });

  it("deve autenticar com credenciais válidas e retornar 200 com token JWT", async () => {
    const res = await request(app).post("/sessions").send({
      email: "joao@email.com",
      password: "senha123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.split(".").length).toBe(3); // formato JWT
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name", "João Silva");
    expect(res.body.user).toHaveProperty("email", "joao@email.com");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("deve retornar 401 quando o e-mail não estiver cadastrado", async () => {
    const res = await request(app).post("/sessions").send({
      email: "inexistente@email.com",
      password: "senha123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 401 quando a senha estiver incorreta", async () => {
    const res = await request(app).post("/sessions").send({
      email: "joao@email.com",
      password: "senhaerrada",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 400 quando campos obrigatórios estiverem ausentes", async () => {
    const res = await request(app).post("/sessions").send({
      email: "joao@email.com",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("o token retornado deve conter o id do usuário no payload", async () => {
    const res = await request(app).post("/sessions").send({
      email: "joao@email.com",
      password: "senha123",
    });

    const payload = JSON.parse(
      Buffer.from(res.body.token.split(".")[1], "base64").toString("utf-8")
    );

    expect(payload).toHaveProperty("sub");
    expect(payload).toHaveProperty("name", "João Silva");
  });
});
