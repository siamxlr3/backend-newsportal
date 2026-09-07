import express from "express";

import {
  createArticlepost,
  deleteArticle,
  getAllArticles,
  getArticleQuery,
  getSingleArticle,
  updateArticle,
} from "../controller/article.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

import upload from "../middleware/upload.js";


const router = express.Router();


// CREATE ARTICLE
router.post(
  "/creat-post",
  upload.single("image"),
  createArticlepost
);


// GET ALL ARTICLES
router.get(
  "/getall-post",
  getAllArticles
);


// GET ARTICLES BY CATEGORY
router.get(
  "/get-query",
  getArticleQuery
);


// GET SINGLE ARTICLE
router.get(
  "/getsingle-post/:id",
  getSingleArticle
);


// UPDATE ARTICLE
router.post(
  "/update-post/:id",
  verifyToken,
  verifyRole,
  upload.single("image"),
  updateArticle
);


// DELETE ARTICLE
router.delete(
  "/delete-post/:id",
  verifyToken,
  verifyRole,
  deleteArticle
);


export default router;