import express from "express"; 
import { verifyToken, authenticate } from '../middlewares/authMiddleware.js';
import { register, login, logout, refreshToken, check  } from "../controllers/authController.js";
 
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken',  refreshToken);
router.post('/logout',  logout);
router.get("/check",  check );

export default router;