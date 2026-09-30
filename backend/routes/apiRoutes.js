import express from "express";
import { loginAdmin, checkAuth, registerUser } from "../controllers/authController.js";
import { getMenuItems, upsertMenuItem, deleteMenuItem } from "../controllers/menuController.js";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getUsers, updateUserRole, getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

// Auth Routes
router.post("/auth/login", loginAdmin);
router.post("/auth/signup", registerUser);
router.get("/auth/check", checkAuth);

// Menu Routes
router.get("/menu", getMenuItems);
router.post("/menu", upsertMenuItem);
router.delete("/menu/:id", deleteMenuItem);

// Order Routes
router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrderStatus);

// User Routes
router.get("/users", getUsers);
router.put("/users/role", updateUserRole);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
