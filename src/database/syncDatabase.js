import { sequelize, connectDB } from "./sequelize.js";

import "../model/index.js";

const syncDatabase = async () => {
  try {
    await connectDB();

    await sequelize.sync({
      alter: true,
    });

    console.log("✅ Tables created/synchronized");
  } catch (error) {
    console.error(
      "❌ Database synchronization failed:",
      error.message
    );
  }
};

export default syncDatabase;