import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import { Types } from "mongoose";
import routes from "../src/server/routes/routes.js";
import { User, categorias, expense, receitas } from "../src/server/database/db.js";
import { dashboard_limit, login_limit } from "../src/server/middleware/rateLimits.middleware.js";

const userId = "507f1f77bcf86cd799439011";
let server: Server;
let baseUrl: string;
let cookie: string;
beforeEach(async () => {
  await dashboard_limit.resetKey("127.0.0.1");
  await login_limit.resetKey("127.0.0.1");
});
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
  ["GET", "/movements/export/excel"],
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

test("login e registo partilham 5 pedidos por minuto e devolvem 429", async () => {
  for (let indice = 0; indice < 5; indice++) {
    const rota = indice % 2 === 0 ? "login" : "register";
    const resposta = await fetch(`${baseUrl}/api/${rota}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    });
    expect(resposta.status).toBe(400);
  }
  const bloqueado = await fetch(`${baseUrl}/api/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  });
  expect(bloqueado.status).toBe(429);
  expect(Number(bloqueado.headers.get("retry-after"))).toBeGreaterThan(0);
  expect((await bloqueado.json()).message).toContain("Demasiadas");
  const dados = await fetch(`${baseUrl}/api/allcategories`);
  expect(dados.status).toBe(401);
});

test("rotas de dados partilham 30 pedidos sem bloquear login ou logout", async () => {
  for (let indice = 0; indice < 30; indice++) {
    const rota = indice % 2 === 0 ? "allcategories" : "movement/0";
    const resposta = await fetch(`${baseUrl}/api/${rota}`);
    expect(resposta.status).toBe(401);
    expect(resposta.headers.get("ratelimit")).toBeTruthy();
  }
  const bloqueado = await fetch(`${baseUrl}/api/newexpense`, { method: "POST" });
  expect(bloqueado.status).toBe(429);
  const login = await fetch(`${baseUrl}/api/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  });
  expect(login.status).toBe(400);
  const logout = await fetch(`${baseUrl}/api/logout`, { method: "POST" });
  expect(logout.status).toBe(401);
});

for (const [rota, modelo] of [["/newexpense", expense], ["/newrevenue", receitas]] as const) {
  test.each([12.5, 42])(`${rota} guarda o título, o valor %s e a data enviados por JSON`, async (valor) => {
    const categoriaId = "507f1f77bcf86cd799439012";
    const procurarCategoria = vi.spyOn(categorias, "findOne").mockResolvedValueOnce(
      categorias.hydrate({ _id: categoriaId, userId, nome: "Alimentação", cor: "#3b82f6" }),
    );
    // Mantém a validação real do Mongoose e substitui apenas a escrita no MongoDB.
    const inserir = vi.spyOn(modelo.collection, "insertOne").mockResolvedValueOnce({
      acknowledged: true,
      insertedId: new Types.ObjectId(),
    });
    try {
      const resposta = await fetch(`${baseUrl}/api${rota}`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Supermercado",
          descricao: "Compras da semana",
          valor,
          data: "2026-05-15",
          categoria: categoriaId,
        }),
      });
      expect(resposta.status).toBe(201);
      expect(inserir).toHaveBeenCalledTimes(1);
      expect(inserir.mock.calls[0][0]).toEqual(expect.objectContaining({
        titulo: "Supermercado",
        descricao: "Compras da semana",
        valor,
        data: new Date("2026-05-15T00:00:00.000Z"),
      }));
      expect(String(inserir.mock.calls[0][0].categoria)).toBe(categoriaId);
      expect(String(inserir.mock.calls[0][0].userId)).toBe(userId);
    } finally {
      procurarCategoria.mockRestore();
      inserir.mockRestore();
    }
  });

  test(`${rota} rejeita uma data impossível antes de gravar`, async () => {
    const inserir = vi.spyOn(modelo.collection, "insertOne");
    try {
      const resposta = await fetch(`${baseUrl}/api${rota}`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Supermercado",
          descricao: "Compras da semana",
          valor: 12.5,
          data: "2026-02-30",
          categoria: "507f1f77bcf86cd799439012",
        }),
      });
      expect(resposta.status).toBe(400);
      expect(inserir).not.toHaveBeenCalled();
    } finally {
      inserir.mockRestore();
    }
  });
}
