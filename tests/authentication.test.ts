import type { Server } from "node:http";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import routes from "../src/server/routes/routes.js";
import { User, categorias } from "../src/server/database/db.js";

const userId = "507f1f77bcf86cd799439011";
let server: Server;
let baseUrl: string;
let cookie: string;
beforeAll(async () => {
  // Isola apenas o MongoDB: os pedidos passam pelo Express, cookies e rotas reais.
  vi.spyOn(User, "findById").mockResolvedValue(User.hydrate({ _id: userId, nome: "Teste" }));
  vi.spyOn(categorias, "find").mockResolvedValue([]);
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "segredo-apenas-para-testes", resave: false, saveUninitialized: false }));
  // Cria uma sessão real apenas nesta aplicação de teste, sem mudar o login de produção.
  app.post("/sessao-teste", (req, res) => {
    req.session.userId = req.body.userId;
    res.sendStatus(204);
  });
  app.use("/api", routes);
  const tratarErro: ErrorRequestHandler = (erro: Error, req, res, next) => {
    void req;
    void next;
    res.status(500).json({ message: erro.message });
  };
  app.use(tratarErro);
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const endereco = server.address();
  if (!endereco || typeof endereco === "string") throw new Error("Servidor de teste sem porta TCP");
  baseUrl = `http://127.0.0.1:${endereco.port}`;
  const resposta = await fetch(`${baseUrl}/sessao-teste`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }),
  });
  const cookieSessao = resposta.headers.get("set-cookie");
  if (!cookieSessao) throw new Error("Sessão de teste sem cookie");
  cookie = cookieSessao.split(";")[0];
});

afterAll(async () => {
  vi.restoreAllMocks();
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((erro) => erro ? reject(erro) : resolve());
    });
  }
});

const rotasPrivadas = [
  ["GET", "/Dashboard"], ["GET", "/movement/10"], ["GET", `/movements/${userId}`],
  ["GET", "/allcategories"], ["GET", `/onecategory/${userId}`], ["POST", "/newcategory"],
  ["PATCH", `/UpdateCategory/${userId}`], ["DELETE", `/DeleteCategory/${userId}`],
  ["POST", "/newexpense"], ["PATCH", `/updateexpense/${userId}`], ["DELETE", `/deleteexpense/${userId}`],
  ["POST", "/newrevenue"], ["PATCH", `/updaterevenue/${userId}`], ["DELETE", `/deleterevenue/${userId}`],
  ["GET", "/summary"], ["GET", "/summary/categories"], ["GET", "/summary/evolution"], ["POST", "/logout"],
];

for (const [method, path] of rotasPrivadas) {
  test(`${method} ${path} rejeita pedidos sem sessão antes do controller`, async () => {
    const resposta = await fetch(`${baseUrl}/api${path}`, { method });
    expect(resposta.status).toBe(401);
    expect(await resposta.json()).toEqual({ message: "Precisas de iniciar sessão" });
  });
}

for (const path of ["/login", "/register"]) {
  test(`${path} continua público`, async () => {
    const resposta = await fetch(`${baseUrl}/api${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    });
    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({ message: "Preenche todos os campos" });
  });
}

test("sessão válida permite executar o controller de categorias", async () => {
  vi.mocked(User.findById).mockClear();
  const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
  expect(resposta.status).toBe(201);
  expect(await resposta.json()).toEqual({ utilizador: [] });
  expect(User.findById).toHaveBeenCalledExactlyOnceWith(userId);
});

test("sessão de utilizador eliminado é rejeitada", async () => {
  vi.mocked(User.findById).mockResolvedValueOnce(null);
  const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
  expect(resposta.status).toBe(401);
  expect(await resposta.json()).toEqual({ message: "Utilizador não encontrado" });
});

test("erro na consulta do utilizador segue para o tratamento de erros", async () => {
  vi.mocked(User.findById).mockRejectedValueOnce(new Error("Base de dados indisponível"));
  const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
  expect(resposta.status).toBe(500);
});

test("a antiga rota de consulta de autenticação deixou de existir", async () => {
  const resposta = await fetch(`${baseUrl}/api/${"au" + "th"}`, { headers: { Cookie: cookie } });
  expect(resposta.status).toBe(404);
});
