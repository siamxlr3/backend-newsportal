import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../model/user.js";
import { uploadToCloudinary } from "../middleware/upload.js";

const ALLOWED_SIGNUP_ROLES = ["user", "author"]; // admin is never self-assigned at signup

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existing = await UserModel.findOne({ where: { email } });

    if (existing) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const safeRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : "user";

    let profileImage = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      profileImage = result.secure_url;
    }

    const newUser = await UserModel.create({
      username,
      email,
      password, // hashed automatically by the beforeCreate hook
      role: safeRole,
      profileImage,
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error registering user",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Missing email or password",
      });
    }

    const user = await UserModel.scope("withPassword").findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error logging in",
    });
  }
};

// CURRENT USER
export const me = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error fetching profile",
    });
  }
};