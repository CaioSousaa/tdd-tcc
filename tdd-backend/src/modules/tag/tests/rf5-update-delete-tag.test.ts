import request from "supertest";
import app from "../../../main/app";
import { UserModel } from "../../../infra/mongo/schemas/user.schema";
import { TagModel } from "../../../infra/mongo/schemas/tag.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/jwt";

describe("RF5 - Editar e Excluir Tags", () => {

  let tokenA: string;
  let tokenB: string;
  let userAId: string;
  let userBId: string;
  let tagId: string;

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

    const tag = await TagModel.create({
      name: "Original",
      color: "#ff0000",
      owner: userAId,
    });
    tagId = tag._id.toString();
  });

  // --- EDIÇÃO ---

  it("deve editar uma tag própria e retornar 200 com dados atualizados", async () => {
    const res = await request(app)
      .put(`/tags/${tagId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Editada", color: "#00ff00" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", tagId);
    expect(res.body).toHaveProperty("name", "Editada");
    expect(res.body).toHaveProperty("color", "#00ff00");
  });

  it("deve permitir edição parcial (somente name)", async () => {
    const res = await request(app)
      .put(`/tags/${tagId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Só Nome" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Só Nome");
    expect(res.body).toHaveProperty("color", "#ff0000");
  });

  it("deve retornar 403 ao tentar editar tag de outro usuário", async () => {
    const res = await request(app)
      .put(`/tags/${tagId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "Invasão" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 404 ao tentar editar tag inexistente", async () => {
    const res = await request(app)
      .put("/tags/000000000000000000000000")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Fantasma" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 401 ao tentar editar sem token", async () => {
    const res = await request(app)
      .put(`/tags/${tagId}`)
      .send({ name: "Sem token" });

    expect(res.status).toBe(401);
  });

  // --- EXCLUSÃO ---

  it("deve excluir uma tag própria e retornar 204", async () => {
    const res = await request(app)
      .delete(`/tags/${tagId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(204);

    const tag = await TagModel.findById(tagId);
    expect(tag).toBeNull();
  });

  it("deve retornar 403 ao tentar excluir tag de outro usuário", async () => {
    const res = await request(app)
      .delete(`/tags/${tagId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");

    const tag = await TagModel.findById(tagId);
    expect(tag).not.toBeNull();
  });

  it("deve retornar 404 ao tentar excluir tag inexistente", async () => {
    const res = await request(app)
      .delete("/tags/000000000000000000000000")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 401 ao tentar excluir sem token", async () => {
    const res = await request(app)
      .delete(`/tags/${tagId}`);

    expect(res.status).toBe(401);
  });
});
