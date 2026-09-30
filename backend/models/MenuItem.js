import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String, default: "Burgers" },
    rating: { type: Number, default: 4.8 },
    bestseller: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false },
    veg: { type: Boolean, default: false },
    in_stock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", MenuItemSchema);
