import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, full_name, role: "customer" });
    
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Missing email or password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.warn(`[Login] User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Login] Incorrect password for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const role = user.role?.toLowerCase().trim() || "customer";
    console.log(`[Login] Success for email: ${normalizedEmail}, role: ${role}`);
    
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role,
      },
    });

  } catch (error) {
    console.error(`[Login] Error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ isAuthenticated: false });
    
    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
  }
};
