import ArticleModel from "../model/article.js";
import ReviewModel from "../model/review.js";
import { uploadToCloudinary } from "../middleware/upload.js";
import redisClient from "../utilitis/redis.js"
import { sendNotification } from "../utilitis/notificationService.js";
import UserModel from "../model/user.js";


const CACHE_TTL = 60 * 5; // 5 minutes

// Shared invalidation helper — called after every write so no
// endpoint keeps serving stale data past this point.
const invalidateArticleCache = async (articleId) => {
  try {
    const categoryKeys = await redisClient.keys("articles:category:*");

    const keysToDelete = [
      "articles:all",
      `articles:single:${articleId}`,
      ...categoryKeys,
    ];

    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
  } catch (err) {
    console.error("Redis invalidation error:", err.message);
  }
};


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

    await invalidateArticleCache(newPost.id);

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
  const cacheKey = `articles:single:${id}`;

  try {
    // Cache is checked only after the visibility check passes, so a
    // cached published-article response never gets served to someone
    // hitting the same URL before the article was published — and a
    // draft is never accidentally cached for the public in the first place.
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const data = await ArticleModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "No article with this id" });
    }

    if (data.status !== "published") {
        return res.status(404).json({ message: "No article with this id" });
      }

    const reviewData = await ReviewModel.findAll({ where: { articleID: id } });

    const responseBody = {
      message: "Article found successfully.",
      data: { data, reviewData },
    };

    // Only cache published articles publicly — never cache a
    // draft/under-review response under a key anyone can hit.
    if (data.status === "published") {
      await redisClient.set(cacheKey, JSON.stringify(responseBody), "EX", CACHE_TTL);
    }

    res.status(200).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

// GET ARTICLES BY CATEGORY
export const getArticleQuery = async (req, res) => {
  const { category } = req.query;
  const cacheKey = `articles:category:${category || "all"}`;

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const filter = category && category !== "all" ? { category } : {status: "published"};

  
    const totalArticle = await ArticleModel.count({ where: filter });

    const articleData = await ArticleModel.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    const responseBody = {
      message: "Article found successfully.",
      data: { totalArticle, articleData },
    };

    await redisClient.set(cacheKey, JSON.stringify(responseBody), "EX", CACHE_TTL);

    res.status(200).json(responseBody);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting article" });
  }
};

// GET ALL ARTICLES
export const getAllArticles = async (req, res) => {
  const cacheKey = "articles:all";

  try {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const data = await ArticleModel.findAll({  where: { status: "published" }, order: [["createdAt", "DESC"]] });

    const responseBody = { message: "Article list successfully.", data };

    await redisClient.set(cacheKey, JSON.stringify(responseBody), "EX", CACHE_TTL);

    res.status(200).json(responseBody);
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

    await invalidateArticleCache(id);

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

    await invalidateArticleCache(id);

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

    await invalidateArticleCache(id);

    const editors = await UserModel.findAll({ where: { role: ["editor", "admin"] } });

 await Promise.all(
  editors.map((editor) =>
    sendNotification({
      recipientID: editor.id,
      type: "article_submitted",
      message: `"${article.title}" was submitted for review`,
      articleID: article.id,
    })
  )
);

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

    await invalidateArticleCache(id);

    await sendNotification({
  recipientID: article.authorID,
  type: "article_approved",
  message: `Your article "${article.title}" was approved`,
  articleID: article.id,
});

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

    await invalidateArticleCache(id);

    await sendNotification({
  recipientID: article.authorID,
  type: "article_rejected",
  message: reason
    ? `Your article "${article.title}" was rejected: ${reason}`
    : `Your article "${article.title}" was rejected`,
  articleID: article.id,
});

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

    await invalidateArticleCache(id);

    await sendNotification({
  recipientID: article.authorID,
  type: "article_published",
  message: `Your article "${article.title}" is now live`,
  articleID: article.id,
});

    res.status(200).json({ message: "Article published", data: article });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error publishing article" });
  }
};