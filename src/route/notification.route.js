// route/notification.route.js
import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controller/notification.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/my-notifications", verifyToken, getMyNotifications);
router.post("/mark-read/:id", verifyToken, markAsRead);
router.post("/mark-all-read", verifyToken, markAllAsRead);

export default router;