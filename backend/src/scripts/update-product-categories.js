import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/product.model.js';

const mappings = [
  { sku: 'INST-SCI-101', name: 'STAT Surgical Scissors Curved 14cm', category: 'Wound Care' },
  { sku: 'INST-SCA-011', name: 'Sterile Disposable Scalpels No. 11', category: 'Wound Care' },
  { sku: 'INST-SUT-RMV', name: 'STAT Sterile Suture Removal Kit', category: 'Wound Care' },
  { sku: 'INST-NH-150', name: 'STAT Mayo-Hegar Needle Holder 16cm', category: 'Wound Care' },
  { sku: 'INST-FOR-120', name: 'STAT Adson Tissue Forceps 12cm', category: 'Wound Care' },
  { sku: 'DISP-GAU-100', name: 'Sterile Gauze Swabs 10x10cm', category: 'Wound Care' },
  { sku: 'DISP-GLV-M', name: 'STAT Nitrile Powder-Free Gloves Medium', category: 'Wound Care' },
  { sku: 'DISP-MSK-3PLY', name: 'Portable Oxygen Concentrator 5L', category: 'Respiratory' },
  { sku: 'DISP-SYR-05', name: 'STAT Electric Breast Pump', category: 'Mother & Baby' },
  { sku: 'SUT-PGLA-30', name: 'STAT Digital TENS Unit', category: 'Pain Relief' },
  { sku: 'SUT-NYL-40', name: 'STAT Orthopedic Heating Pad', category: 'Pain Relief' },
  { sku: 'STER-TPE-INT', name: 'Standard Folding Wheelchair', category: 'Rehabilitation' },
  { sku: 'STER-PCH-200', name: 'STAT Adjustable Safety Rails', category: 'Elder Care' },
  { sku: 'DIAG-BPM-DIG', name: 'STAT Pro Digital Sphygmomanometer', category: 'Diagnostic Tools' },
  { sku: 'DIAG-STH-CLN', name: 'STAT Classic Dual-Head Stethoscope', category: 'Diagnostic Tools' }
];

async function updateCategories() {
  await connectDB();
  try {
    for (const item of mappings) {
      const product = await Product.findOne({ sku: item.sku });
      if (product) {
        product.name = item.name;
        product.category = item.category;
        await product.save();
        console.log(`Updated product ${item.sku}: Name -> "${item.name}", Category -> "${item.category}"`);
      } else {
        console.log(`Product with SKU ${item.sku} not found`);
      }
    }
    console.log('Product mapping update completed successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

updateCategories();
