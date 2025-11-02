import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoute from "./src/route/auth.route.js";
import userRoute from "./src/route/user.route.js";
import reviewRoute from "./src/route/review.route.js";
import articleRoute from "./src/route/article.route.js";
import stateRoute from "./src/route/state.route.js";
import uploadRoute from "./src/route/uploadRoute.js"

const app = express();

app.use(cors({
    origin: ["http://localhost:5173","https://news-portal-iota-three.vercel.app"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function main() {
    await mongoose.connect(process.env.UB_URL);

    app.get('/', (req, res) => {
        res.send('Welcome to the News-Portal App!');
    });

    // Route uses
    app.use("/api/auth", authRoute);
    app.use("/api/user", userRoute);
    app.use("/api/review", reviewRoute);
    app.use("/api/article", articleRoute);
    app.use("/api/state", stateRoute);
    app.use("/api/upload",uploadRoute)


    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

main().then(() => console.log("MongoDB connected")).catch(err => console.log(err));
