import ReviewModel from "../model/review.js";


// CREATE REVIEW
export const PostReview = async (req, res) => {

  try {

    const {
      comment,
      userID,
      articleID,
      rating,
    } = req.body;

    if (!comment || !userID || !articleID) {
      return res.status(400).json({
        message: "Missing required parameters",
      });
    }

    await ReviewModel.create({
      comment,
      userID,
      articleID,
      rating,
    });

    res.status(200).json({
      message: "Reviews posted successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error posting review",
    });
  }
};


// GET USER REVIEWS
export const getAllReviews = async (req, res) => {

  const { userID } = req.params;

  try {

    const data = await ReviewModel.findAll({
      where: {
        userID,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "No review found",
      });
    }

    res.status(200).json({
      message: "Reviews founded successfully",
      data,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


// DELETE REVIEW
export const deleteReview = async (req, res) => {

  const { id } = req.params;

  try {

    const data = await ReviewModel.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "No review found",
      });
    }

    await data.destroy();

    res.status(200).json({
      message: "Review deleted",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};