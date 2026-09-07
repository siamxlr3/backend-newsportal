import multer from "multer";
import cloudinary from "../utilitis/cloudinary.js";


const storage = multer.memoryStorage();


const upload = multer({
  storage: storage,
});


export const uploadToCloudinary = (file) => {

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "news-portal",
      },

      (error, result) => {

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(file.buffer);
  });
};


export default upload;