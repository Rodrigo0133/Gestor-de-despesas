import "dotenv/config";
import app from "./app.js";
import { ligarBaseDados } from "./database/db.js";

const PORT = Number(process.env.PORT ?? 3000);
await ligarBaseDados();
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});
