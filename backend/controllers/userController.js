import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    await User.findByIdAndUpdate(userId, { role: newRole });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const { full_name, phone, avatar_url } = req.body;
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const user = await User.findByIdAndUpdate(decoded.id, updateData, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
