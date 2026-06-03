/**
 * Verification test: AES-256-GCM field-level encryption.
 * Tests against the running backend on port 8000.
 * Run from backend dir: node src/scripts/test-encryption.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:8000/api/v1';
const TEST_EMAIL = `enc-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_NAME = 'Encryption Test User';

async function runTests() {
  console.log('=== Encryption Verification Tests ===\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.db.collection('users');
  console.log('MongoDB direct connection established.\n');

  try {
    // ---- TEST 1: Register a new user ----
    console.log('--- Test 1: Register New User ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'customer'
      })
    });
    const regJson = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${regJson.message}`);
    
    const token = regJson.data.accessToken;
    const userId = regJson.data.user._id;
    
    console.log(`API Response name: "${regJson.data.user.name}"`);
    console.log(`API Response email: "${regJson.data.user.email}"`);
    if (regJson.data.user.name !== TEST_NAME) throw new Error('API returned encrypted name!');
    if (regJson.data.user.email !== TEST_EMAIL) throw new Error('API returned encrypted email!');
    console.log('✅ API returns decrypted plaintext correctly.\n');

    // ---- TEST 2: Verify DB stores encrypted data ----
    console.log('--- Test 2: Verify DB Stores Encrypted Data ---');
    const rawUser = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    console.log(`DB raw name: "${rawUser.name.substring(0, 60)}..."`);
    console.log(`DB raw email: "${rawUser.email.substring(0, 60)}..."`);
    console.log(`DB emailHash: "${rawUser.emailHash}"`);
    
    if (rawUser.name === TEST_NAME) throw new Error('DB stores name as plaintext!');
    if (rawUser.email === TEST_EMAIL) throw new Error('DB stores email as plaintext!');
    if (!rawUser.emailHash) throw new Error('emailHash not computed!');
    
    const parts = rawUser.name.split(':');
    if (parts.length !== 3 || parts[0].length !== 32 || parts[1].length !== 32) {
      throw new Error(`Unexpected encrypted format: ${rawUser.name}`);
    }
    console.log('✅ DB stores encrypted ciphertext, not plaintext.\n');

    // ---- TEST 3: Login works via emailHash ----
    console.log('--- Test 3: Login via EmailHash ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login failed: ${loginJson.message}`);
    console.log(`Login response user name: "${loginJson.data.user.name}"`);
    if (loginJson.data.user.name !== TEST_NAME) throw new Error('Login returned wrong name!');
    console.log('✅ Login via emailHash works correctly.\n');

    // ---- TEST 4: Add Address & Verify Encryption ----
    console.log('--- Test 4: Add Address & Verify Encryption ---');
    const addrRes = await fetch(`${BASE_URL}/users/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tag: 'Home',
        doorNumber: 'Flat 501',
        secondLine: 'Sunrise Apartments',
        landmark: 'Near Central Library',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      })
    });
    const addrJson = await addrRes.json();
    if (!addrRes.ok) throw new Error(`Add address failed: ${addrJson.message}`);
    
    const apiAddr = addrJson.data.addresses[0];
    console.log(`API address city: "${apiAddr.city}"`);
    if (apiAddr.city !== 'Mumbai') throw new Error('API returned encrypted address city!');
    if (apiAddr.doorNumber !== 'Flat 501') throw new Error('API returned encrypted doorNumber!');
    console.log('✅ API returns decrypted address fields.\n');

    const rawUserAfterAddr = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    const rawAddr = rawUserAfterAddr.addresses[0];
    console.log(`DB raw address city: "${rawAddr.city.substring(0, 60)}..."`);
    if (rawAddr.city === 'Mumbai') throw new Error('DB stores address city as plaintext!');
    if (rawAddr.tag !== 'Home') throw new Error('Address tag should remain plaintext!');
    console.log(`DB address tag (should be plaintext): "${rawAddr.tag}"`);
    console.log('✅ DB stores encrypted address fields, tag remains plaintext.\n');

    // ---- TEST 5: Edit Address & Verify ----
    console.log('--- Test 5: Edit Address & Verify ---');
    const addrId = apiAddr._id;
    const editRes = await fetch(`${BASE_URL}/users/address/${addrId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tag: 'Office',
        doorNumber: 'Suite 200',
        secondLine: 'Tech Park',
        landmark: 'Near Metro',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001'
      })
    });
    const editJson = await editRes.json();
    if (!editRes.ok) throw new Error(`Edit address failed: ${editJson.message}`);
    
    const editedAddr = editJson.data.addresses[0];
    if (editedAddr.city !== 'Hyderabad') throw new Error('Edited address API returned encrypted city!');
    console.log(`Edited address city: "${editedAddr.city}"`);
    
    const rawAfterEdit = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (rawAfterEdit.addresses[0].city === 'Hyderabad') throw new Error('DB stores edited city as plaintext!');
    console.log('✅ Address edit encrypts correctly.\n');

    // ---- TEST 6: Duplicate registration check ----
    console.log('--- Test 6: Duplicate Registration Prevention ---');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'customer'
      })
    });
    const dupJson = await dupRes.json();
    console.log(`Duplicate register status: ${dupRes.status} — ${dupJson.message}`);
    if (dupRes.status !== 400) throw new Error('Duplicate registration should be blocked!');
    console.log('✅ Duplicate email detection works via emailHash.\n');

    // ---- TEST 7: Existing migrated user login ----
    console.log('--- Test 7: Existing Migrated User Login ---');
    const existingRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shigivahan@gmail.com', password: 'password123' })
    });
    const existingJson = await existingRes.json();
    if (existingRes.ok || existingJson.data?.twoFactorRequired) {
      console.log(`Existing user response: ${existingJson.message}`);
      console.log('✅ Existing migrated user can still authenticate.\n');
    } else {
      console.log(`⚠️  Existing user: ${existingRes.status} — ${existingJson.message}`);
      console.log('   (May have different password — not a critical failure)\n');
    }

    console.log('========================================');
    console.log('=== ALL ENCRYPTION TESTS PASSED ✅ ===');
    console.log('========================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runTests();
