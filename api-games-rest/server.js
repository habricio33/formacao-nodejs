import app from "./app.js";
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
