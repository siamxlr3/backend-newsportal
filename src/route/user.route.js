import express from 'express';
import { deleteUser, getAllusers, getSingleUser, updateUser, updateUserRole } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get('/get-singleuser/:id', verifyToken, getSingleUser)
router.get('/get-alluser', verifyToken, verifyRole("admin"), getAllusers)
router.delete('/delete-user/:id', verifyToken, verifyRole("admin"), deleteUser)
router.post('/update-user/:id', verifyToken, upload.single("image"), updateUser)
router.post("/update-user-role/:id", verifyToken, verifyRole("admin"), updateUserRole)

export default router;