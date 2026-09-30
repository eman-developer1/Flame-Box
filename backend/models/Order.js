import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customer: { type: CustomerSchema, required: true },
    items: [OrderItemSchema],
    payment_method: { type: String, required: true },
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
