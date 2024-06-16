import express from "express";
import {login, logout, register} from "../controllers/auth_controllers.js"
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
export default router;