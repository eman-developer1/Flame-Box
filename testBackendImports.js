import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import apiRoutes from './backend/routes/apiRoutes.js';
import connectDB from './backend/config/db.js';
import User from './backend/models/User.js';
import Order from './backend/models/Order.js';
import MenuItem from './backend/models/MenuItem.js';

console.log('SUCCESS: All backend modules, models, and routes imported successfully without errors!');
console.log('Registered route stack count:', apiRoutes.stack.length);
process.exit(0);
