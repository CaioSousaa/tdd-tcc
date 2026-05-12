import request from "supertest";
import app from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";

describe("RF1 - Cadastro de Usuário", () => {
  it("deve cadastrar usuário com dados válidos e retornar 201", async () => {
    const res = await request(app).post("/users").send({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "João Silva");
    expect(res.body).toHaveProperty("email", "joao@email.com");
    expect(res.body).toHaveProperty("createdAt");
    expect(res.body).not.toHaveProperty("password");
  });

  it("deve retornar 409 quando o e-mail já estiver cadastrado", async () => {
    await request(app).post("/users").send({
      name: "João Silva",
      email: "duplicado@email.com",
      password: "senha123",
    });

    const res = await request(app).post("/users").send({
      name: "Outro Nome",
      email: "duplicado@email.com",
      password: "outrasenha",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 400 quando campos obrigatórios estiverem ausentes", async () => {
    const res = await request(app).post("/users").send({
      email: "semcampos@email.com",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deve armazenar a senha como hash bcrypt, nunca em texto puro", async () => {
    await request(app).post("/users").send({
      name: "Maria",
      email: "maria@email.com",
      password: "senha123",
    });

    const user = await UserModel.findOne({ email: "maria@email.com" });
    expect(user).not.toBeNull();
    expect(user!.password).not.toBe("senha123");
    expect(user!.password).toMatch(/^\$2[ab]\$/);
  });

  it("deve retornar 400 quando o e-mail tiver formato inválido", async () => {
    const res = await request(app).post("/users").send({
      name: "João",
      email: "emailsemarroba",
      password: "senha123",
    });

    expect(res.status).toBe(400);
  });
});
