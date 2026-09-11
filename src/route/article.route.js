import express from "express";

import {
  createArticlepost,
  deleteArticle,
  getAllArticles,
  getArticleQuery,
  getSingleArticle,
  updateArticle,
  // submitArticle,
  startReview,
  approveArticle,
  rejectArticle,
  publishArticle,
} from "../controller/article.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import upload from "../middleware/upload.js";

const router = express.Router();


router.post("/creat-post",verifyToken,verifyRole("author", "editor", "admin"),upload.single("image"),createArticlepost);

router.get("/getall-post", getAllArticles);

router.get("/get-query", getArticleQuery);

router.get("/getsingle-post/:id", getSingleArticle);

router.post("/update-post/:id",verifyToken,upload.single("image"),updateArticle);

router.delete("/delete-post/:id",verifyToken,verifyRole("admin"),deleteArticle);

// router.post("/:id/submit",verifyToken,verifyRole("author", "editor", "admin"),submitArticle);

router.post("/:id/start-review",verifyToken,verifyRole("editor", "admin"),startReview);

router.post("/:id/approve",verifyToken,verifyRole("editor", "admin"),approveArticle);

router.post("/:id/reject",verifyToken,verifyRole("editor", "admin"),rejectArticle);

router.post("/:id/publish",verifyToken,verifyRole("editor", "admin"),publishArticle);

export default router;