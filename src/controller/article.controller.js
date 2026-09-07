import ArticleModel from "../model/article.js";
import ReviewModel from "../model/review.js";
import { uploadToCloudinary } from "../middleware/upload.js";

// CREATE ARTICLE
export const createArticlepost = async (req, res) => {

  try {

    let image = null;

    if (req.file) {

      const result = await uploadToCloudinary(req.file);

      image = result.secure_url;
    }


    const newPost = await ArticleModel.create({
      ...req.body,
      image: image,
    });


    res.status(201).json({
      message: "Article created successfully.",
      data: newPost,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error creating new article",
    });
  }
};

// GET SINGLE ARTICLE
export const getSingleArticle = async (req, res) => {

  const { id } = req.params;

  try {

    const data = await ArticleModel.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "No article with this id",
      });
    }


    const reviewData = await ReviewModel.findAll({
      where: {
        articleID: id,
      },
    });


    res.status(200).json({
      message: "Article found successfully.",

      data: {
        data,
        reviewData,
      },
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error getting article",
    });
  }
};


// GET ARTICLES BY CATEGORY
export const getArticleQuery = async (req, res) => {

  try {

    const { category } = req.query;

    const filter = {};


    if (category && category !== "all") {
      filter.category = category;
    }


    const totalArticle = await ArticleModel.count({
      where: filter,
    });


    const articleData = await ArticleModel.findAll({
      where: filter,

      order: [
        ["createdAt", "DESC"],
      ],
    });


    res.status(200).json({
      message: "Article found successfully.",

      data: {
        totalArticle,
        articleData,
      },
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error getting article",
    });
  }
};


// GET ALL ARTICLES
export const getAllArticles = async (req, res) => {

  try {

    const data = await ArticleModel.findAll({

      order: [
        ["createdAt", "DESC"],
      ],

    });


    res.status(200).json({
      message: "Article list successfully.",
      data,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error getting article",
    });
  }
};


// UPDATE ARTICLE
export const updateArticle = async (req, res) => {

  const { id } = req.params;

  const {
    title,
    description,
    category,
  } = req.body;


  try {

    const data = await ArticleModel.findByPk(id);


    if (!data) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }


    await data.update({

      title,
      description,
      category,

      // If new image is uploaded,
      // save the Cloudinary URL.
      // Otherwise keep the old image.
      image: req.file
        ? req.file.path
        : data.image,
    });


    res.status(200).json({
      message: "Article updated successfully.",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error updating article",
    });
  }
};


// DELETE ARTICLE
export const deleteArticle = async (req, res) => {

  const { id } = req.params;


  try {

    const data = await ArticleModel.findByPk(id);


    if (!data) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }


    await data.destroy();


    res.status(200).json({
      message: "Article deleted successfully.",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error deleting article",
    });
  }
};