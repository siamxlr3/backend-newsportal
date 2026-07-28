import { dbPool } from "../../index.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../utilitis/s3.js";
import { createArticlesTable } from "../model/article.model.js"

export const createArticlepost = async (req, res) => {

  try {

    const { title, description, category, author } = req.body;
    const image = req.body.image;

    const insertRes = await dbPool.query(
      `INSERT INTO articles (title, description, image, category, author_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, image, category, author]
    );
    const savePost = insertRes.rows[0];

    const reviewsRes = await dbPool.query(
      "SELECT * FROM reviews WHERE article_id = $1",
      [savePost.id]
    );
    const reviews = reviewsRes.rows;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((accum, review) => accum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await dbPool.query(
        `UPDATE articles SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [averageRating, savePost.id]
      );
    }

    res.status(201).json({ message: "Article created successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating new article" });
  }
};

export const getSingleArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const articleRes = await dbPool.query("SELECT * FROM articles WHERE id = $1", [id]);
    const data = articleRes.rows[0];
    if (!data) {
      return res.status(404).json({ message: "No article with this id" });
    }

    const reviewRes = await dbPool.query(
      "SELECT * FROM reviews WHERE article_id = $1",
      [id]
    );

    res.status(200).json({ message: "Article found successfully.", data: { data, reviewData: reviewRes.rows } });
  } catch (err) {
    res.status(500).json({ message: "Error getting article" });
  }
};

export const getArticleQuery = async (req, res) => {
  try {
    const { category } = req.query;
    const params = [];
    let whereClause = "";
    if (category && category !== "all") {
      params.push(category);
      whereClause = ` WHERE category = $${params.length}`;
    }

    const countRes = await dbPool.query(`SELECT COUNT(*) FROM articles${whereClause}`, params);
    const totalArticle = parseInt(countRes.rows[0].count, 10);

    const articleRes = await dbPool.query(
      `SELECT * FROM articles${whereClause} ORDER BY created_at DESC`,
      params
    );

    res.status(200).json({ message: "Article found successfully.", data: { totalArticle, articleData: articleRes.rows } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const result = await dbPool.query("SELECT * FROM articles ORDER BY created_at DESC");
    res.status(200).json({ message: "Article list successfully.", data: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Error getting article" });
  }
};

export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  try {
    const existingRes = await dbPool.query("SELECT * FROM articles WHERE id = $1", [id]);
    const existing = existingRes.rows[0];
    if (!existing) {
      return res.status(404).json({ message: "Article not found." });
    }

    const image = req.file ? req.file.location : req.body.image || existing.image;

    if (req.file && existing.image) {
      await deleteImageFromS3(existing.image);
    }

    const updateRes = await dbPool.query(
      `UPDATE articles
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image = COALESCE($3, image),
           category = COALESCE($4, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, image, category, id]
    );

    if (!updateRes.rows[0]) {
      return res.status(404).json({ message: "Article not found." });
    }
    res.status(200).json({ message: "Article updated successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating article" });
  }
};

export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteRes = await dbPool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [id]);
    const data = deleteRes.rows[0];
    if (!data) {
      return res.status(404).json({ message: "Article not found." });
    }

    if (data.image) {
      await deleteImageFromS3(data.image);
    }

    await dbPool.query("DELETE FROM reviews WHERE article_id = $1", [id]);

    res.status(200).json({ message: "Article deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting article" });
  }
};

export const countAllArticles = async () => {
  const result = await dbPool.query("SELECT COUNT(*) FROM articles");
  return parseInt(result.rows[0].count, 10);
};

export const getMonthlyArticlesCount = async () => {
  const result = await dbPool.query(
    `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS count
     FROM articles
     WHERE created_at >= NOW() - INTERVAL '12 months'
     GROUP BY month
     ORDER BY month ASC`
  );
  return result.rows.map((row) => ({ month: row.month, count: parseInt(row.count, 10) }));
};

const deleteImageFromS3 = async (imageUrl) => {
  try {
    const key = imageUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
    if (!key) return;
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (err) {
    console.log("Failed to delete old image from S3:", err.message);
  }
};