import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import * as authService from './src/services/auth.service.js';

dotenv.config();

async function test() {
  const mongoURI = process.env.MONGODB_URI;
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  const testEmail = `test-reg-${Date.now()}@example.com`;
  const userData = {
    name: 'Test Registration User',
    email: testEmail,
    password: 'password123',
    role: 'customer'
  };

  console.log('Step 1: Calling registerUser...');
  const user = await authService.registerUser(userData);
  console.log('After registerUser:');
  console.log('  user.email:', user.email);
  console.log('  user.name:', user.name);

  console.log('Step 2: Calling generateAccessAndRefreshTokens...');
  const tokens = await authService.generateAccessAndRefreshTokens(user._id);
  console.log('After generateAccessAndRefreshTokens:');
  console.log('  user.email:', user.email);
  console.log('  user.name:', user.name);

  // Clean up
  await User.deleteOne({ _id: user._id });
  console.log('Cleaned up test user');

  await mongoose.disconnect();
}

test().catch(console.error);
