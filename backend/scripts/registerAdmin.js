import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flamebite';

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    is_active: { type: Boolean, default: true },
    phone: { type: String },
    address: { type: String },
    avatar_url: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

async function main() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB successfully.');

    const targetEmail = 'ekkage@mailto.plus';
    const targetPassword = 'ekkage@mailto.plus';
    const targetRole = 'admin';

    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    let user = await User.findOne({ email: targetEmail.toLowerCase().trim() });

    if (user) {
      console.log(`Existing user found for ${user.email}. Updating role and password...`);
      user.password = hashedPassword;
      user.role = targetRole;
      user.is_active = true;
      if (!user.full_name) {
        user.full_name = 'Admin';
      }
      await user.save();
      console.log(`User ${user.email} updated successfully!`);
    } else {
      console.log(`User ${targetEmail} not found. Creating new admin user...`);
      user = await User.create({
        full_name: 'Admin',
        email: targetEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: targetRole,
        is_active: true,
      });
      console.log(`User ${user.email} created successfully!`);
    }

    // Verify bcrypt comparison
    const verify = await bcrypt.compare(targetPassword, user.password);
    console.log('Verification check (password matches hash):', verify);
    console.log('Final user details:', {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });

    await mongoose.disconnect();
    console.log('REGISTRATION_COMPLETE_SUCCESS');
    process.exit(0);
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    process.exit(1);
  }
}

main();
