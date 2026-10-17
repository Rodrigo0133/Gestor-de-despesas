import { afterEach, expect, test, vi } from "vitest";
import { createServer, type Server } from "node:http";

vi.mock("../src/server/database/db.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/server/database/db.js")>();
  return { ...original, ligarBaseDados: async () => { throw new Error("Atlas indisponível no teste"); } };
});

let server: Server | undefined;
afterEach(async () => {
  if (server) await new Promise<void>((resolve, reject) => server!.close(error => error ? reject(error) : resolve()));
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test("a API responde 503 quando o Atlas falha sem impedir a importação no deploy", async () => {
  vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:1/test");
  vi.stubEnv("SESSION_SECRET", "segredo-apenas-para-testes");
  vi.spyOn(console, "error").mockImplementation(() => {});
  const { default: app } = await import("../src/server/app.js");
  server = createServer(app);
  await new Promise<void>(resolve => server!.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Porta de teste indisponível");
  const url = "http://127.0.0.1:" + address.port + "/api/allcategories";
  const response = await fetch(url);
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ message: "Base de dados temporariamente indisponível." });
  expect((await fetch(url)).status).toBe(503);
});
