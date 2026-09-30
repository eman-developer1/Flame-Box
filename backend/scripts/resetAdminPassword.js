import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '../.env' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flamebite';

const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String,
});
const User = mongoose.model("UserReset", UserSchema, "users");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetPassword() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  rl.question('Enter the email of the admin account: ', async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`User not found for email: ${normalizedEmail}`);
      process.exit(1);
    }

    rl.question('Enter the NEW password (min 6 chars): ', async (newPassword) => {
      if (!newPassword || newPassword.length < 6) {
        console.log("Password must be at least 6 characters.");
        process.exit(1);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      console.log(`Successfully updated password for ${normalizedEmail}.`);
      
      mongoose.disconnect();
      process.exit(0);
    });
  });
}

resetPassword();
