import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";

const ReviewModel = sequelize.define(
  "Review",
  {
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    articleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "articles",
        key: "id",
      },
    },

    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);

export default ReviewModel;