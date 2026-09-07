import ArticleModel from "./article.js";
import ReviewModel from "./review.js";
import UserModel from "./user.js";

// User → Articles
UserModel.hasMany(ArticleModel, {
  foreignKey: "authorID",
  as: "articles",
  onDelete: "CASCADE",
});

// Article → User
ArticleModel.belongsTo(UserModel, {
  foreignKey: "authorID",
  as: "author",
});

// Article → Reviews
ArticleModel.hasMany(ReviewModel, {
  foreignKey: "articleID",
  as: "reviews",
  onDelete: "CASCADE",
});

// Review → Article
ReviewModel.belongsTo(ArticleModel, {
  foreignKey: "articleID",
  as: "article",
});

// User → Reviews
UserModel.hasMany(ReviewModel, {
  foreignKey: "userID",
  as: "reviews",
  onDelete: "CASCADE",
});

// Review → User
ReviewModel.belongsTo(UserModel, {
  foreignKey: "userID",
  as: "user",
});

export {
  UserModel,
  ArticleModel,
  ReviewModel,
};