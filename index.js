import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import redisClient from "./src/utilitis/redis.js"

import syncDatabase from "./src/database/syncDatabase.js";

import authRoute from "./src/route/auth.route.js";
import userRoute from "./src/route/user.route.js";
import reviewRoute from "./src/route/review.route.js";
import articleRoute from "./src/route/article.route.js";
// import stateRoute from "./src/route/state.route.js";
import uploadRoute from "./src/route/uploadRoute.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy violation"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const port = 5000;

export const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function main() {
  await syncDatabase();
  await redisClient.ping()

  app.get("/", (req, res) => {
    res.send("Welcome to the News-Portal App!");
  });

  app.use("/api/auth", authRoute);
  app.use("/api/user", userRoute);
  app.use("/api/review", reviewRoute);
  app.use("/api/article", articleRoute);
  // app.use("/api/state", stateRoute);
  app.use("/api/upload", uploadRoute);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

main()
  .then(() => console.log("App started"))
  .catch((err) => console.error("Application error:", err));