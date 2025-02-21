import { DataTypes } from "sequelize";
import connection from "../config/database.js";

const Game = connection.define('games', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10,2), 
        allowNull: false
    }
    
})

Game.sync({force: false})

export default Game;