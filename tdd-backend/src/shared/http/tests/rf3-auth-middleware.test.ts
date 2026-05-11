import request from "supertest";
import { app } from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/UserSchema";
import { TagModel } from "../../../infra/mongo/schemas/TagSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF3 - Autorização por Usuário", () => {

  let tokenUserA: string;
  let tokenUserB: string;
  let userAId: string;
  let userBId: string;

  beforeEach(async () => {
    const userA = await UserModel.create({
      name: "User A",
      email: "usera@email.com",
      password: await bcrypt.hash("senha123", 10),
    });
    const userB = await UserModel.create({
      name: "User B",
      email: "userb@email.com",
      password: await bcrypt.hash("senha123", 10),
    });

    userAId = userA._id.toString();
    userBId = userB._id.toString();

    tokenUserA = jwt.sign({ sub: userAId, name: "User A" }, JWT_SECRET, { expiresIn: "1h" });
    tokenUserB = jwt.sign({ sub: userBId, name: "User B" }, JWT_SECRET, { expiresIn: "1h" });
  });

  it("deve retornar 401 em rota protegida sem token", async () => {
    const res = await request(app).get("/tags");

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 com token malformado", async () => {
    const res = await request(app)
      .get("/tags")
      .set("Authorization", "Bearer token.invalido.aqui");

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 com token expirado", async () => {
    const expiredToken = jwt.sign({ sub: userAId }, JWT_SECRET, { expiresIn: "-1s" });

    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it("deve permitir acesso a rota protegida com token válido", async () => {
    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenUserA}`);

    expect(res.status).not.toBe(401);
  });

  it("usuário A não deve ver recursos criados pelo usuário B", async () => {
    await TagModel.create({ name: "Tag do B", color: "#ff0000", owner: userBId });

    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("usuário A deve ver apenas seus próprios recursos", async () => {
    await TagModel.create({ name: "Tag do A", color: "#00ff00", owner: userAId });
    await TagModel.create({ name: "Tag do B", color: "#ff0000", owner: userBId });

    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Tag do A");
  });

  it("rotas públicas não devem exigir token", async () => {
    const resRegister = await request(app).post("/users").send({
      name: "Novo",
      email: "novo@email.com",
      password: "senha123",
    });
    expect(resRegister.status).not.toBe(401);

    const resLogin = await request(app).post("/sessions").send({
      email: "usera@email.com",
      password: "senha123",
    });
    expect(resLogin.status).not.toBe(401);
  });
});
