import {
  findUserById,
  findAllUsers,
  deleteUserById,
  updateUserById,
  updateUserRoleById,
} from "../model/user.model.js";

export const getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User founded successfully", data: user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllusers = async (req, res) => {
  try {
    const user = await findAllUsers();
    res.status(200).json({ message: "User founded successfully", data: user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await deleteUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, profession, bio, profileImage } = req.body;
  try {
    const user = await updateUserById(id, {
      username,
      profession,
      bio,
      profileImage,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await updateUserRoleById(id, role);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};