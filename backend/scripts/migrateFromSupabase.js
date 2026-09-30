import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config({ path: '../.env' }); // Load from root
dotenv.config({ path: '.env' }); // Load from backend

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!MONGODB_URI || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars (MONGODB_URI, SUPABASE_URL, or SUPABASE_KEY)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const migrate = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Migrate profiles to Users
    console.log("Fetching profiles from Supabase...");
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
    if (profileError) throw profileError;

    console.log(`Found ${profiles.length} profiles. Migrating...`);
    for (const profile of profiles) {
      const existingUser = await User.findOne({ email: profile.email || `${profile.id}@example.com` });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('defaultPassword123!', 10);
        await User.create({
          full_name: profile.full_name || 'Unknown',
          email: profile.email || `${profile.id}@example.com`,
          password: hashedPassword,
          role: profile.role || 'customer',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || ''
        });
      }
    }
    console.log("Profiles migrated.");

    // Migrate menu items
    console.log("Fetching menu items from Supabase...");
    const { data: items, error: itemsError } = await supabase.from('menu_items').select('*');
    if (itemsError) throw itemsError;

    console.log(`Found ${items.length} menu items. Migrating...`);
    for (const item of items) {
      const existingItem = await MenuItem.findOne({ id: item.id.toString() });
      if (!existingItem) {
        await MenuItem.create({
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          spicy: item.spicy,
          veg: item.veg,
          bestseller: item.bestseller,
          rating: item.rating,
          in_stock: item.inStock || item.in_stock || true
        });
      }
    }
    console.log("Menu items migrated.");

    // Migrate orders
    console.log("Fetching orders from Supabase...");
    const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
    if (ordersError) throw ordersError;

    console.log(`Found ${orders.length} orders. Migrating...`);
    for (const order of orders) {
      const existingOrder = await Order.findOne({ id: order.id.toString() });
      if (!existingOrder) {
        await Order.create({
          id: order.id.toString(),
          customer: typeof order.customer === 'string' ? JSON.parse(order.customer) : order.customer,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          subtotal: order.subtotal,
          delivery: order.delivery,
          tax: order.tax,
          total: order.total,
          payment_method: order.payment_method || order.paymentMethod,
          status: order.status,
          created_at: order.created_at || order.createdAt
        });
      }
    }
    console.log("Orders migrated.");

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrate();
