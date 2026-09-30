import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    is_active: { type: Boolean, default: true },
    phone: { type: String },
    address: { type: String },
    avatar_url: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
