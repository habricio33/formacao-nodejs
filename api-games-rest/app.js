import express from 'express';
import connection from './src/config/database.js';
import gameRoutes from "./src/routes/gameRoutes.js";
import authRoutes  from './src/routes/authRoutes.js';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());  

app.use(cors({
    origin: "http://127.0.0.1:5500",  
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Inclua OPTIONS
    allowedHeaders: ['Authorization', 'Content-Type',  "x-refresh-token"] // Headers permitidos
}));


app.use(express.json());
// Middleware para processar dados de formulários
app.use(express.urlencoded({ extended: false }));

// rota games
app.use("/api", gameRoutes);
app.use('/api/auth', authRoutes);

// Testando a conexão
connection.authenticate()
    .then(() => {
        console.log("🚀 Conexão bem-sucedida com o banco de dados!");
    })
    .catch((error) => {
        console.error("❌ Erro ao conectar ao banco de dados:", error);
    });

export default app;

