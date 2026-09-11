import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";

const ArticleModel = sequelize.define(
  "Article",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    authorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "author_id",
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "submitted", //  submitted | under_review | approved | published
    },

    reviewerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reviewer_id",
    },

    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "published_at",
    },
  },
  {
    tableName: "articles",
    timestamps: true,
  }
);

export default ArticleModel;