import { dbPool } from "../../index.js";

/**
 * PostgreSQL Database Model Structure for Reviews
 */
export class ReviewModel {
  constructor(data = {}) {
    this._id = data._id || data.id || null;
    this.id = data.id || data._id || null;
    this.comment = data.comment;
    this.rating = data.rating ?? data.ratting ?? 0;
    this.ratting = this.rating;
    this.userID = data.userID || data.user_id;
    this.articleID = data.articleID || data.article_id;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  async save() {
    if (this._id || this.id) {
      const idToUpdate = this._id || this.id;
      const res = await dbPool.query(
        `UPDATE reviews
         SET comment = COALESCE($1, comment),
             rating = COALESCE($2, rating),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [this.comment, this.rating, idToUpdate]
      );
      if (res.rows[0]) {
        Object.assign(this, formatReview(res.rows[0]));
      }
      return this;
    } else {
      const res = await dbPool.query(
        `INSERT INTO reviews (comment, rating, user_id, article_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [this.comment, this.rating, this.userID, this.articleID]
      );
      if (res.rows[0]) {
        Object.assign(this, formatReview(res.rows[0]));
      }
      return this;
    }
  }

  static async create(data) {
    const review = new ReviewModel(data);
    return await review.save();
  }

  static async find(filter = {}) {
    const articleId = filter.articleID || filter.article_id;
    const userId = filter.userID || filter.user_id;

    let queryText;
    let params = [];

    if (articleId) {
      queryText = `
        SELECT r.*, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.article_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [articleId];
    } else if (userId) {
      queryText = `SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC`;
      params = [userId];
    } else {
      queryText = `SELECT * FROM reviews ORDER BY created_at DESC`;
    }

    const res = await dbPool.query(queryText, params);
    const reviews = res.rows.map((row) => {
      const formatted = formatReview(row);
      if (row.username) {
        formatted.userID = { _id: row.user_id, id: row.user_id, username: row.username };
      }
      return new ReviewModel(formatted);
    });

    reviews.populate = () => reviews;
    return reviews;
  }

  static async deleteMany(filter = {}) {
    const articleId = filter.articleID || filter.article_id;
    if (!articleId) return [];

    const res = await dbPool.query("DELETE FROM reviews WHERE article_id = $1 RETURNING *", [articleId]);
    return res.rows.map((row) => new ReviewModel(formatReview(row)));
  }
}

export const createReview = ({ comment, rating = 0, userID, articleID }) =>
  ReviewModel.create({ comment, rating, userID, articleID });

export const findReviewsByArticleId = (articleId) => ReviewModel.find({ articleID: articleId });
export const findReviewsByUserId = (userId) => ReviewModel.find({ userID: userId });
export const deleteReviewById = async (id) => {
  const res = await dbPool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);
  return res.rows[0] ? formatReview(res.rows[0]) : null;
};
export const deleteReviewsByArticleId = (articleId) => ReviewModel.deleteMany({ articleID: articleId });
export const countReviews = async () => {
  const res = await dbPool.query("SELECT COUNT(*) FROM reviews");
  return parseInt(res.rows[0].count, 10);
};

const formatReview = (row) => ({
  _id: row.id,
  id: row.id,
  comment: row.comment,
  rating: row.rating,
  ratting: row.rating,
  userID: row.user_id,
  articleID: row.article_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export default ReviewModel;