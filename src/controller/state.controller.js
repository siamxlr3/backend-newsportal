import UserModel from "../model/user.js";
import ArticleModel from "../model/article.js";
import ReviewModel from "../model/review.js";

export const adminState = async (req, res) => {

  try {

    const totalUser = await UserModel.count();

    const totalReviews = await ReviewModel.count();

    const totalPostallTime = await ArticleModel.count();

    res.status(200).json({
      totalUser,
      totalReviews,
      totalPostallTime,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};