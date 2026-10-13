import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import session from "express-session";
import routes from "../dist/server/routes/routes.js";
import { User, categorias } from "../dist/server/database/db.js";

const userId = "507f1f77bcf86cd799439011";
let server;
let baseUrl;
let cookie;
let utilizadorExiste = true;
let erroBaseDados = false;
let consultasUtilizador = 0;
const findByIdOriginal = User.findById;
const findCategoriasOriginal = categorias.find;

before(async () => {
  // Isola apenas o MongoDB: os pedidos passam pelo Express, cookies e rotas reais.
  User.findById = async () => {
    consultasUtilizador++;
    if (erroBaseDados) throw new Error("Base de dados indisponível");
    return utilizadorExiste ? { _id: userId, nome: "Teste" } : null;
  };
  categorias.find = async () => [];
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "segredo-apenas-para-testes", resave: false, saveUninitialized: false }));
  // Cria uma sessão real apenas nesta aplicação de teste, sem mudar o login de produção.
  app.post("/sessao-teste", (req, res) => {
    req.session.userId = req.body.userId;
    res.sendStatus(204);
  });
  app.use("/api", routes);
  app.use((erro, req, res, next) => {
    void req;
    void next;
    res.status(500).json({ message: erro.message });
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const resposta = await fetch(`${baseUrl}/sessao-teste`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }),
  });
  cookie = resposta.headers.get("set-cookie").split(";")[0];
});

after(async () => {
  User.findById = findByIdOriginal;
  categorias.find = findCategoriasOriginal;
  await new Promise((resolve) => server.close(resolve));
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
    assert.equal(resposta.status, 401);
    assert.deepEqual(await resposta.json(), { message: "Precisas de iniciar sessão" });
  });
}

for (const path of ["/login", "/register"]) {
  test(`${path} continua público`, async () => {
    const resposta = await fetch(`${baseUrl}/api${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    });
    assert.equal(resposta.status, 400);
    assert.deepEqual(await resposta.json(), { message: "Preenche todos os campos" });
  });
}

test("sessão válida permite executar o controller de categorias", async () => {
  consultasUtilizador = 0;
  const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
  assert.equal(resposta.status, 201);
  assert.deepEqual(await resposta.json(), { utilizador: [] });
  assert.equal(consultasUtilizador, 1);
});

test("sessão de utilizador eliminado é rejeitada", async () => {
  utilizadorExiste = false;
  try {
    const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
    assert.equal(resposta.status, 401);
    assert.deepEqual(await resposta.json(), { message: "Utilizador não encontrado" });
  } finally { utilizadorExiste = true; }
});

test("erro na consulta do utilizador segue para o tratamento de erros", async () => {
  erroBaseDados = true;
  try {
    const resposta = await fetch(`${baseUrl}/api/allcategories`, { headers: { Cookie: cookie } });
    assert.equal(resposta.status, 500);
  } finally { erroBaseDados = false; }
});

test("a antiga rota de consulta de autenticação deixou de existir", async () => {
  const resposta = await fetch(`${baseUrl}/api/${"au" + "th"}`, { headers: { Cookie: cookie } });
  assert.equal(resposta.status, 404);
});
