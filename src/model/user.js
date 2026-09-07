import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../database/sequelize.js";

const UserModel = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "profile_image",
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "user", // "user" | "author" | "editor" | "admin"
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    profession: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,

    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },

      beforeUpdate: async (user) => {
        // Only re-hash if password field was actually changed —
        // otherwise every profile update would double-hash it.
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },

    defaultScope: {
      // Never leak password hashes on normal finds.
      // Use `.unscoped()` or `.scope(null)` when you explicitly need it (e.g. login).
      attributes: { exclude: ["password"] },
    },

    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

export default UserModel;