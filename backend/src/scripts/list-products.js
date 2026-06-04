import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/product.model.js';

async function listProducts() {
  await connectDB();
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. SKU: ${p.sku} | Name: ${p.name} | Category: ${p.category} | Price: ${p.price}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

listProducts();
