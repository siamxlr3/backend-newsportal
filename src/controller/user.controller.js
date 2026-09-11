import UserModel from "../model/user.js";

const ALLOWED_ROLES = ["user", "author", "editor", "admin"];

// GET SINGLE USER
export const getSingleUser = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await UserModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User founded successfully", data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET ALL USERS
export const getAllusers = async (req, res) => {
  try {
    const data = await UserModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "User founded successfully", data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await UserModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    await data.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// UPDATE USER
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, profession, bio } = req.body;

  try {
   
     const data = await UserModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    let profileImage = data.profileImage;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      profileImage = result.secure_url;
    }

    await data.update({ username, profession, bio, profileImage });

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// UPDATE USER ROLE
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role value" });
  }

  try {
    const data = await UserModel.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    await data.update({ role });

    res.status(200).json({ message: "User role updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};