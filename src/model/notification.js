// model/notification.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";

const NotificationModel = sequelize.define(
  "Notification",
  {
    recipientID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "recipient_id",
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
      // "article_submitted" | "article_approved" | "article_rejected"
      // | "article_published" | "new_comment"
    },

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    articleID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "article_id",
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

export default NotificationModel;