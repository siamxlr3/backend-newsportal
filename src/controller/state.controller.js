import { dbPool } from "../../index.js";
import { countUsers } from "../model/user.model.js";
import { countAllArticles, getMonthlyArticlesCount } from "./article.controller.js";
import { countReviews } from "../model/review.model.js";

export const adminState = async (req, res) => {
  try {
    const totalUser = await countUsers();
    const totalReviews = await countReviews();
    const totalPostallTime = await countAllArticles();
    const monthlyPosts = await getMonthlyArticlesCount();

    res.status(200).json({
      totalUser,
      totalReviews,
      totalPostallTime,
      monthlyPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};