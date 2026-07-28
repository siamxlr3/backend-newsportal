import "dotenv/config";

import express from "express";
import pkg from "pg";
const { Client, Pool } = pkg;
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDb } from "./src/utilitis/dbInit.js";

import authRoute from "./src/route/auth.route.js";
import userRoute from "./src/route/user.route.js";
import reviewRoute from "./src/route/review.route.js";
import articleRoute from "./src/route/article.route.js";
import stateRoute from "./src/route/state.route.js";
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
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
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

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureDatabaseExists() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace(/^\//, "");

    // Connect to default 'postgres' database first to check/create target database
    url.pathname = "/postgres";
    const client = new Client({ connectionString: url.toString() });
    await client.connect();

    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);

    }

    await client.end();
  } catch (err) {
    console.error("Error creating database automatically:", err.message);
  }
}

async function main() {

  await ensureDatabaseExists();

  const client = await dbPool.connect();
  client.release();

  await initDb();

  app.get("/", (req, res) => {
    res.send("Welcome to the News-Portal App!");
  });

  app.use("/api/auth", authRoute);
  app.use("/api/user", userRoute);
  app.use("/api/review", reviewRoute);
  app.use("/api/article", articleRoute);
  app.use("/api/state", stateRoute);
  app.use("/api/upload", uploadRoute);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

main()
  .then(() => console.log("App started"))
  .catch((err) => console.error("Database connection error:", err));