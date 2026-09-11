import ArticleModel from "../model/article.js";
import ReviewModel from "../model/review.js";
import { uploadToCloudinary } from "../middleware/upload.js";


// CREATE ARTICLE
export const createArticlepost = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    let image = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      image = result.secure_url;
    }

    const newPost = await ArticleModel.create({
      title,
      description,
      category,
      image,
      authorID: req.user.id,
      status: "submitted",
    });

    res.status(201).json({
      message: "Article created successfully.",
      data: newPost,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating new article" });
  }
};

// GET SINGLE ARTICLE
export const getSingleArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ArticleModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "No article with this id" });
    }

    const reviewData = await ReviewModel.findAll({ where: { articleID: id } });

    res.status(200).json({
      message: "Article found successfully.",
      data: { data, reviewData },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

// GET ARTICLES BY CATEGORY
export const getArticleQuery = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "all" ? { category } : {};


    const totalArticle = await ArticleModel.count({ where: filter });
    const articleData = await ArticleModel.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Article found successfully.",
      data: { totalArticle, articleData },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

// GET ALL ARTICLES
export const getAllArticles = async (req, res) => {
  try {
    const data = await ArticleModel.findAll({ order: [["createdAt", "DESC"]] });

    res.status(200).json({ message: "Article list successfully.", data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

// UPDATE ARTICLE
export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;

  try {
    const data = await ArticleModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "Article not found." });
    }

    const isOwner = req.user.id === data.authorID;
    const isPrivileged = ["editor", "admin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "You cannot edit this article." });
    }

    if (data.status === "published" && !isPrivileged) {
      return res.status(400).json({ message: "Published articles can't be edited directly." });
    }

    let image = data.image;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      image = result.secure_url;
    }

    await data.update({ title, description, category, image });

    res.status(200).json({ message: "Article updated successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating article" });
  }
};

// DELETE ARTICLE
export const deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ArticleModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "Article not found." });
    }

    await data.destroy();

    res.status(200).json({ message: "Article deleted successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting article" });
  }
};

// ===== WORKFLOW ACTIONS =====

// SUBMIT ARTICLE (author: draft -> submitted)
// export const submitArticle = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const article = await ArticleModel.findByPk(id);

//     if (!article) {
//       return res.status(404).json({ message: "Article not found" });
//     }

//     if (article.authorID !== req.user.id) {
//       return res.status(403).json({ message: "You can only submit your own articles" });
//     }

//     if (article.status !== "draft") {
//       return res.status(400).json({
//         message: `Cannot submit an article that is currently '${article.status}'`,
//       });
//     }

//     await article.update({ status: "submitted" });

//     // TODO: notify editors — "New article submitted for review"

//     res.status(200).json({ message: "Article submitted for review", data: article });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error submitting article" });
//   }
// };

// START REVIEW (editor/admin: submitted -> under_review)
export const startReview = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status !== "submitted") {
      return res.status(400).json({
        message: `Cannot start review on an article that is currently '${article.status}'`,
      });
    }

    await article.update({ status: "under_review", reviewerID: req.user.id });

    res.status(200).json({ message: "Article moved to review", data: article });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error starting review" });
  }
};

// APPROVE ARTICLE (editor/admin: under_review -> approved)
export const approveArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status !== "under_review") {
      return res.status(400).json({
        message: `Cannot approve an article that is currently '${article.status}'`,
      });
    }

    if (article.reviewerID !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the assigned reviewer can approve this article" });
    }

    await article.update({ status: "approved" });

    // TODO: notify author — "Your article was approved"

    res.status(200).json({ message: "Article approved", data: article });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error approving article" });
  }
};

// REJECT ARTICLE (editor/admin: under_review -> draft)
export const rejectArticle = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status !== "under_review") {
      return res.status(400).json({
        message: `Cannot reject an article that is currently '${article.status}'`,
      });
    }

    if (article.reviewerID !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the assigned reviewer can reject this article" });
    }

    await article.update({ status: "draft" });

    // TODO: notify author — "Your article was rejected" (include `reason`)

    res.status(200).json({ message: "Article sent back to draft", data: article });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error rejecting article" });
  }
};

// PUBLISH ARTICLE (editor/admin: approved -> published)
export const publishArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await ArticleModel.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status !== "approved") {
      return res.status(400).json({
        message: `Cannot publish an article that is currently '${article.status}'`,
      });
    }

    await article.update({ status: "published", publishedAt: new Date() });

    // TODO: notify author — "Your article is now live"

    res.status(200).json({ message: "Article published", data: article });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error publishing article" });
  }
};