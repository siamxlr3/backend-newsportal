import {
  createReview,
  findReviewsByUserId,
  deleteReviewById,
} from "../model/review.model.js";

export const PostReview = async (req, res) => {
  try {
    const { comment, userID, articleID, rating } = req.body;

    if (!comment || !userID || articleID === undefined) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    await createReview({ comment, rating, userID, articleID });

    res.status(200).json({ message: "Reviews posted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error posting review" });
  }
};

export const getAllReviews = async (req, res) => {
  const { userID } = req.params;
  try {
    const data = await findReviewsByUserId(userID);
    if (data.length === 0) {
      return res.status(404).json({ message: "No review found" });
    }
    res.status(200).json({ message: "Reviews founded successfully", data: data });
  } catch (err) {
    res.status(404).json({ message: "No review found" });
  }
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await deleteReviewById(id);
    if (!data) {
      return res.status(404).json({ message: "No review found" });
    }
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    res.status(404).json({ message: "No review found" });
  }
};