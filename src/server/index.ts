import express from "express"
import { ligarBaseDados }  from "./database/db"
const PORT = 3000
const app = express()
app.use(express.json())

// Routes
app.post("/novadespesa", async (req, res) => {
    console.log(req.body)
    res.status(200).send({ message: "Despesa recebida" })
})


// Database
await ligarBaseDados();

// Listen
app.listen(PORT, () => {
    console.log(`Server a rodar em http://localhost:${PORT}`)
})