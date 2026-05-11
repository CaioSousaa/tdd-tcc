import request from "supertest";
import { app } from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/UserSchema";
import { TagModel } from "../../../infra/mongo/schemas/TagSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF6 - Listar Tags", () => {

  let tokenA: string;
  let tokenB: string;
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

    tokenA = jwt.sign({ sub: userAId, name: "User A" }, JWT_SECRET, { expiresIn: "1h" });
    tokenB = jwt.sign({ sub: userBId, name: "User B" }, JWT_SECRET, { expiresIn: "1h" });
  });

  it("deve retornar 200 com array vazio quando o usuário não tiver tags", async () => {
    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("deve retornar somente as tags do usuário autenticado", async () => {
    await TagModel.create({ name: "Tag A1", color: "#ff0000", owner: userAId });
    await TagModel.create({ name: "Tag A2", color: "#00ff00", owner: userAId });
    await TagModel.create({ name: "Tag B1", color: "#0000ff", owner: userBId });

    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t: any) => t.name)).toEqual(
      expect.arrayContaining(["Tag A1", "Tag A2"])
    );
    expect(res.body.map((t: any) => t.name)).not.toContain("Tag B1");
  });

  it("cada item retornado deve conter id, name, color, owner e createdAt", async () => {
    await TagModel.create({ name: "Tag Completa", color: "#abcdef", owner: userAId });

    const res = await request(app)
      .get("/tags")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name", "Tag Completa");
    expect(res.body[0]).toHaveProperty("color", "#abcdef");
    expect(res.body[0]).toHaveProperty("owner", userAId);
    expect(res.body[0]).toHaveProperty("createdAt");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/tags");

    expect(res.status).toBe(401);
  });
});
