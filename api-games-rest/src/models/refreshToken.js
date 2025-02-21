import { DataTypes } from "sequelize";
import connection from "../config/database.js";

 
    const RefreshToken = connection.define("RefreshToken", {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

RefreshToken.sync({force: false})

export default RefreshToken;
