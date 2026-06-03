/**
 * One-time migration script: Encrypt existing plaintext user data in MongoDB.
 * 
 * This script reads all users directly from the MongoDB collection (bypassing
 * Mongoose hooks), encrypts PII fields, computes emailHash, and writes them back.
 * 
 * Usage: node src/scripts/migrate-encrypt.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { encrypt, isEncrypted, hashForLookup } from '../utils/encryption.js';

const ENCRYPTED_USER_FIELDS = ['name', 'email'];
const ENCRYPTED_ADDRESS_FIELDS = ['doorNumber', 'secondLine', 'landmark', 'city', 'state', 'pincode'];

async function migrate() {
  console.log('=== Database Encryption Migration ===');
  console.log(`Connecting to MongoDB...`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const collection = mongoose.connection.db.collection('users');
  const users = await collection.find({}).toArray();
  console.log(`Found ${users.length} users to process.\n`);

  let encrypted = 0;
  let skipped = 0;

  for (const user of users) {
    // Check if already encrypted (check name field)
    if (user.name && isEncrypted(user.name)) {
      console.log(`  [SKIP] ${user._id} — already encrypted`);
      skipped++;
      continue;
    }

    const updateFields = {};

    // Encrypt top-level PII fields
    for (const field of ENCRYPTED_USER_FIELDS) {
      if (user[field] && !isEncrypted(user[field])) {
        updateFields[field] = encrypt(user[field]);
      }
    }

    // Compute emailHash from the original plaintext email
    if (user.email) {
      updateFields.emailHash = hashForLookup(user.email);
    }

    // Encrypt address subdocument fields
    if (user.addresses && user.addresses.length > 0) {
      const encryptedAddresses = user.addresses.map((addr) => {
        const newAddr = { ...addr };
        for (const field of ENCRYPTED_ADDRESS_FIELDS) {
          if (newAddr[field] && !isEncrypted(newAddr[field])) {
            newAddr[field] = encrypt(newAddr[field]);
          }
        }
        return newAddr;
      });
      updateFields.addresses = encryptedAddresses;
    }

    // Write back
    await collection.updateOne({ _id: user._id }, { $set: updateFields });
    console.log(`  [OK] ${user._id} (${user.email}) — encrypted`);
    encrypted++;
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`  Encrypted: ${encrypted}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Total:     ${users.length}`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
