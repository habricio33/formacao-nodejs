import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Carregar as variáveis de ambiente do .env
dotenv.config();

const connection = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        timezone: process.env.DB_TIMEZONE
    }
);


export default  connection ;