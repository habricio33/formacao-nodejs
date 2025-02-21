import express from "express";
import { getAllGames, createGame, updateGame, deleteGame, getGameById } from "../controllers/gameController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

 
router.get("/games", authenticate ,getAllGames);
router.get("/games/:id",authenticate , getGameById);  
router.post("/games", authenticate , createGame);
router.put("/games/:id", authenticate ,updateGame);
router.delete("/games/:id", authenticate ,deleteGame);

export default router;