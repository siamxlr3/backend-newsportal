import express from "express";
import { register, login, me } from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get("/", verifyToken, me);

export default router;