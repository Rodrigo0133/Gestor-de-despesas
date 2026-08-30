import express from "express";
import { ligarBaseDados } from "./database/db.js";
import cors from "cors"
const PORT = 3000;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

// Routes
app.post("/novadespesa", async (req, res) => {
  console.log(req.body);
  res.status(200).send({ message: "Despesa recebida" });
});

app.post("/registrar", async (req,res) => {
  const { nome, email, senha } = req.body;

  console.log(nome, email, senha);

  return res.status(201).json({
    message: "Dados recebidos",
  });
});
// Database
await ligarBaseDados();

// Listen
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});


