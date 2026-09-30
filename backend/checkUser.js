import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flamebite';

const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String,
});
const User = mongoose.model("UserCheck", UserSchema, "users");

async function check() {
  await mongoose.connect(MONGODB_URI);
  
  const user = await User.findOne({ email: new RegExp('ekkage@mailto.plus', 'i') });
  if (!user) {
    console.log("User not found!");
  } else {
    console.log("User found:");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Password hash exists?", !!user.password);
    console.log("Hash length:", user.password?.length);
    console.log("Starts with $2a$ or $2b$?", user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$'));

    const match = await bcrypt.compare('defaultPassword123!', user.password);
    console.log("Matches 'defaultPassword123!'?", match);
  }

  mongoose.disconnect();
}

check();
