import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

let isConnected = false;

export const connectDB = async () => {
  try {
    if (!isConnected) {
      await sequelize.authenticate();

      console.log("✅ Database connected successfully");

      isConnected = true;
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};