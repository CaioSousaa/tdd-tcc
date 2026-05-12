import request from "supertest";
import app from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import { TagModel } from "../../../infra/mongo/schemas/tag.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF4 - Criar Tag", () => {

  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      name: "João Silva",
      email: "joao@email.com",
      password: await bcrypt.hash("senha123", 10),
    });
    userId = user._id.toString();
    token = jwt.sign({ sub: userId, name: "João Silva" }, JWT_SECRET, { expiresIn: "1h" });
  });

  it("deve criar uma tag com dados válidos e retornar 201", async () => {
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Urgente", color: "#ff0000" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Urgente");
    expect(res.body).toHaveProperty("color", "#ff0000");
    expect(res.body).toHaveProperty("owner", userId);
    expect(res.body).toHaveProperty("createdAt");
  });

  it("deve usar o userId do token como owner, ignorando qualquer owner enviado no body", async () => {
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Tag", color: "#00ff00", owner: "id-falso-qualquer" });

    expect(res.status).toBe(201);
    expect(res.body.owner).toBe(userId);
    expect(res.body.owner).not.toBe("id-falso-qualquer");
  });

  it("deve retornar 400 quando o campo name estiver ausente", async () => {
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ color: "#ff0000" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 400 quando o campo color estiver ausente", async () => {
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Urgente" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 401 quando nenhum token for enviado", async () => {
    const res = await request(app)
      .post("/tags")
      .send({ name: "Urgente", color: "#ff0000" });

    expect(res.status).toBe(401);
  });

  it("deve persistir a tag no banco com o owner correto", async () => {
    await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Persistida", color: "#0000ff" });

    const tag = await TagModel.findOne({ name: "Persistida" });
    expect(tag).not.toBeNull();
    expect(tag!.owner.toString()).toBe(userId);
    expect(tag!.color).toBe("#0000ff");
  });
});
