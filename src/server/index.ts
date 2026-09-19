import express from "express";
import {
  ligarBaseDados
} from "./database/db.js";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import routes from "./routes/routes.js";
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const PORT = Number(process.env.PORT ?? 3000);
const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

if (!mongoUri || !sessionSecret) {
  throw new Error("Define MONGODB_URI e SESSION_SECRET no .env");
}

app.use(
  session({
    name: "gestor.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
app.use(express.json());

// Routes
app.use("/api",routes)

await ligarBaseDados();

// Listen
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});
