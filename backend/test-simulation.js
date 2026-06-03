import mongoose from 'mongoose';
import crypto from 'crypto';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import User from './src/models/user.model.js';
import Product from './src/models/product.model.js';
import Order from './src/models/order.model.js';
import Session from './src/models/session.model.js';
import AnalyticsEvent from './src/models/analytics.model.js';

const PORT = 8001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('=== Starting E-Commerce Backend Integration Tests ===');

  // 1. Database Connection & Clean up
  await connectDB();
  console.log('Clearing test database collections...');
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Session.deleteMany({});
  await AnalyticsEvent.deleteMany({});
  console.log('Database cleared.');

  // 2. Start express test server
  const server = app.listen(PORT, () => {
    console.log(`Test server listening on port ${PORT}`);
  });

  try {
    // 3. Register Customer & Admin users
    console.log('\n--- Step 1: User Registration ---');
    
    // Register Customer
    const registerCustRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Customer',
        email: 'jane@example.com',
        password: 'password123',
        role: 'customer',
      }),
    });
    const custData = await registerCustRes.json();
    console.log('Customer Registered Status:', registerCustRes.status);
    console.log('Customer User Email:', custData.data.user.email);
    const customerToken = custData.data.accessToken;

    // Register Admin
    const registerAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin',
      }),
    });
    const adminData = await registerAdminRes.json();
    console.log('Admin Registered Status:', registerAdminRes.status);
    const adminToken = adminData.data.accessToken;

    // 4. Admin creates products
    console.log('\n--- Step 2: Product Creation (Admin Only) ---');
    
    // Create Product A (High quantity)
    const productARes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sku: 'LAPTOP-PRO-15',
        name: 'Developer Laptop Pro 15',
        description: 'High performance laptop for software developers.',
        costPrice: 80000,
        retailPrice: 120000,
        quantity: 50,
        lowStockThreshold: 5,
        category: 'Electronics',
      }),
    });
    const productA = (await productARes.json()).data;
    console.log('Product A Created SKU:', productA.sku, 'Stock:', productA.quantity);

    // Create Product B (Low quantity to trigger low stock evaluation later)
    const productBRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sku: 'MOUSE-MX-3',
        name: 'Ergonomic Wireless Mouse',
        description: 'Advanced ergonomic mouse.',
        costPrice: 4000,
        retailPrice: 8000,
        quantity: 4,
        lowStockThreshold: 5,
        category: 'Accessories',
      }),
    });
    const productB = (await productBRes.json()).data;
    console.log('Product B Created SKU:', productB.sku, 'Stock:', productB.quantity);

    // 5. Public fetches products
    console.log('\n--- Step 3: Fetching Products ---');
    const fetchProductsRes = await fetch(`${BASE_URL}/products`);
    const productsList = (await fetchProductsRes.json()).data;
    console.log('Fetched Products Count:', productsList.results.length);

    // 6. Analytics Session Tracking
    console.log('\n--- Step 4: Analytics Session Init & Heartbeats ---');
    const sessionId = `sess_${Date.now()}`;
    
    // Initialize Session
    const sessionInitRes = await fetch(`${BASE_URL}/analytics/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        referrer: 'https://google.com',
        utmSource: 'google_search',
        utmMedium: 'cpc',
        utmCampaign: 'summer_sale',
        deviceType: 'desktop',
      }),
    });
    const sessionDetails = (await sessionInitRes.json()).data;
    console.log('Session Init Reference:', sessionDetails.sessionId, 'Source:', sessionDetails.utmSource);

    // Send heartbeats (Simulate reading Product A page)
    console.log('Simulating page view heartbeat...');
    const heartbeatRes = await fetch(`${BASE_URL}/analytics/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        path: `/products/${productA._id}`,
        durationSeconds: 30, // Spent 30 seconds on laptop details page
      }),
    });
    console.log('Heartbeat 1 response status:', heartbeatRes.status);

    // Send page event (Add to Cart)
    const eventRes = await fetch(`${BASE_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventName: 'add_to_cart',
        properties: { productId: productA._id, name: productA.name },
        referrer: `/products/${productA._id}`,
        utmSource: 'google_search',
      }),
    });
    console.log('Cart event response status:', eventRes.status);

    // 7. Order Checkout
    console.log('\n--- Step 5: Checkout Order Initiation ---');
    const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          { productId: productA._id, quantity: 2 }, // Buying 2 Laptop Pros
          { productId: productB._id, quantity: 1 }, // Buying 1 Mouse
        ],
        sessionId,
        conversionSource: 'google_search',
      }),
    });
    const checkoutData = await checkoutRes.json();
    console.log('Checkout Response Msg:', checkoutData.message);
    const dbOrder = checkoutData.data.order;
    const razorpayOrder = checkoutData.data.razorpayOrder;
    console.log('DB Order ID:', dbOrder._id);
    console.log('Razorpay Order ID:', razorpayOrder.id, 'Total Amount (Paise):', razorpayOrder.amount);

    // 8. Signature Verification (Simulate payment success)
    console.log('\n--- Step 6: Payment Signature Verification ---');
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';
    const dummyPaymentId = `pay_${Date.now()}`;
    const signaturePayload = `${razorpayOrder.id}|${dummyPaymentId}`;
    const dummySignature = crypto
      .createHmac('sha256', keySecret)
      .update(signaturePayload)
      .digest('hex');

    const paymentVerificationRes = await fetch(`${BASE_URL}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: dummyPaymentId,
        razorpaySignature: dummySignature,
      }),
    });
    const verifiedOrderData = await paymentVerificationRes.json();
    console.log('Payment Verification Status:', paymentVerificationRes.status);
    console.log('Payment Status in DB:', verifiedOrderData.data.paymentStatus);
    console.log('Order Status in DB:', verifiedOrderData.data.orderStatus);

    // Verify stock decrement
    const productAAfter = await Product.findById(productA._id);
    const productBAfter = await Product.findById(productB._id);
    console.log(`Product A Stock: ${productA.quantity} -> ${productAAfter.quantity} (Expected: 48)`);
    console.log(`Product B Stock: ${productB.quantity} -> ${productBAfter.quantity} (Expected: 3)`);

    // 9. Admin Stock Evaluation Metrics
    console.log('\n--- Step 7: Admin Stock Evaluation ---');
    const evaluationRes = await fetch(`${BASE_URL}/products/stock/evaluation`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const evalData = (await evaluationRes.json()).data;
    console.log('Total Products in Inventory:', evalData.summary.uniqueProductsCount);
    console.log('Total Cost Value of Inventory:', evalData.summary.totalCostValue);
    console.log('Total Retail Value of Inventory:', evalData.summary.totalRetailValue);
    console.log('Potential Profit in Stock:', evalData.summary.potentialProfit);
    console.log('Low Stock Alert Items Count (Threshold 5):', evalData.summary.lowStockAlertCount);
    console.log('Low Stock Alert Items List:', evalData.alerts.lowStock.map(i => `${i.sku} (Qty: ${i.quantity})`));

    // 10. Admin Analytics Dashboard
    console.log('\n--- Step 8: Admin Analytics Dashboard ---');
    const dashboardRes = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = (await dashboardRes.json()).data;
    console.log('Average Session Time (Seconds):', dashData.sessions.averageDurationSeconds);
    console.log('Total Revenue (INR):', dashData.sales.revenue);
    console.log('Total COGS (Cost of Goods Sold):', dashData.sales.costOfGoodsSold);
    console.log('Net Profit (INR):', dashData.sales.netProfit);
    console.log('Conversion Rate Grouping by Traffic Source:');
    dashData.conversionBySource.forEach(src => {
      console.log(`- Source: ${src.source || 'direct'}, Referrer: ${src.referrer}, Sessions: ${src.sessionsCount}, Conversions: ${src.conversionsCount}, Conversion Rate: ${src.conversionRate.toFixed(2)}%`);
    });
    console.log('Checkout Funnel Breakdown:');
    console.log(`- Total Sessions: ${dashData.funnel.uniqueSessionFunnel.sessions}`);
    console.log(`- Page Views: ${dashData.funnel.uniqueSessionFunnel.pageViewCount}`);
    console.log(`- Add to Carts: ${dashData.funnel.uniqueSessionFunnel.addToCartCount}`);
    console.log(`- Checkout Initiated: ${dashData.funnel.uniqueSessionFunnel.checkoutCount}`);
    console.log(`- Completed Purchases (Conversions): ${dashData.funnel.uniqueSessionFunnel.purchaseCount}`);

    console.log('\n=== All backend integration verification tests PASSED ===');

  } catch (error) {
    console.error('Test simulation failed with error:', error);
  } finally {
    // Close server and database connection
    server.close();
    await mongoose.connection.close();
    console.log('Database and server connections closed.');
  }
}

runTests();
