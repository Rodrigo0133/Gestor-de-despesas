import express, { type RequestHandler } from "express";
import mongoose from "mongoose";
import { ligarBaseDados } from "./database/db.js";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import routes from "./routes/routes.js";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const app = express();
const sessionSecret = process.env.SESSION_SECRET;
if (!process.env.MONGODB_URI || !sessionSecret) {
  throw new Error("Define MONGODB_URI e SESSION_SECRET no ambiente");
}

// A Vercel termina HTTPS no proxy antes de encaminhar para a Function.
app.set("trust proxy", 1);
app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

let sessaoPronta: Promise<RequestHandler> | undefined;

function prepararSessao(): Promise<RequestHandler> {
  if (!sessaoPronta) {
    sessaoPronta = ligarBaseDados()
      .then(() => session({
        name: "gestor.sid",
        secret: sessionSecret!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ client: mongoose.connection.getClient() }),
        cookie: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24,
        },
      }))
      .catch((error: unknown) => {
        sessaoPronta = undefined;
        throw error;
      });
  }
  return sessaoPronta;
}

// A ligação só é iniciada pelos pedidos da API, nunca pelo build.
app.use("/api", async (req, res, next) => {
  try {
    const middlewareSessao = await prepararSessao();
    middlewareSessao(req, res, next);
  } catch (error) {
    console.error("Não foi possível ligar à base de dados:", error instanceof Error ? error.name : "Erro desconhecido");
    res.status(503).json({ message: "Base de dados temporariamente indisponível." });
  }
});
app.use("/api", routes);

export default app;
