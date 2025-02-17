import express from 'express';
import connection from './src/config/database.js';
import gameRoutes from "./src/routes/gameRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
// Middleware para processar dados de formulários
app.use(express.urlencoded({ extended: false }));

// rota games
app.use("/api", gameRoutes);

// Testando a conexão
connection.authenticate()
    .then(() => {
        console.log("🚀 Conexão bem-sucedida com o banco de dados!");
    })
    .catch((error) => {
        console.error("❌ Erro ao conectar ao banco de dados:", error);
    });

export default app;

