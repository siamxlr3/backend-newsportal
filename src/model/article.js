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
  },
  {
    tableName: "articles",
    timestamps: true,
  }
);

export default ArticleModel;