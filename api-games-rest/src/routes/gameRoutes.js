import express from "express";
import { getAllGames, createGame, updateGame, deleteGame, getGameById } from "../controllers/gameController.js";
 
const router = express.Router();

router.get("/games", getAllGames);
router.get("/games/:id", getGameById);
router.post("/games", createGame);
router.put("/games/:id", updateGame);
router.delete("/games/:id", deleteGame);

export default router;