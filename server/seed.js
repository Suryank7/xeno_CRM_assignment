/**
 * Seed script: generates 500+ realistic Indian customers and 2000+ orders.
 * Run with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Customer = require('./src/models/Customer');
const Order = require('./src/models/Order');

// --- Realistic Indian data pools ---
const firstNames = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Kavita',
  'Arjun', 'Neha', 'Siddharth', 'Pooja', 'Karan', 'Divya', 'Varun', 'Meera',
  'Aditya', 'Riya', 'Nikhil', 'Shreya', 'Manish', 'Isha', 'Rajesh', 'Ananya',
  'Suresh', 'Deepika', 'Akash', 'Nisha', 'Gaurav', 'Sanya', 'Harsh', 'Tanvi',
  'Vivek', 'Sakshi', 'Pranav', 'Kritika', 'Kunal', 'Aditi', 'Dhruv', 'Simran',
  'Abhishek', 'Pallavi', 'Tushar', 'Swati', 'Mohit', 'Megha', 'Vishal', 'Komal',
  'Anand', 'Jyoti',
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Agarwal',
  'Mehta', 'Reddy', 'Nair', 'Iyer', 'Malhotra', 'Chopra', 'Rao', 'Deshmukh',
  'Pillai', 'Chauhan', 'Saxena', 'Bhat', 'Kapoor', 'Tiwari', 'Mishra', 'Pandey',
  'Bansal',
];

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Bhopal',
  'Nagpur', 'Surat', 'Vadodara', 'Noida', 'Gurgaon', 'Goa',
];

const categories = ['Coffee', 'Tea', 'Snacks', 'Apparel', 'Electronics', 'Books', 'Beauty', 'Home', 'Fitness', 'Accessories'];

const products = {
  Coffee: ['Arabica Beans', 'Cold Brew Pack', 'Espresso Pods', 'Latte Mix', 'Filter Coffee'],
  Tea: ['Green Tea', 'Masala Chai', 'Earl Grey', 'Chamomile', 'Matcha Powder'],
  Snacks: ['Granola Bar', 'Trail Mix', 'Protein Chips', 'Dark Chocolate', 'Energy Bites'],
  Apparel: ['Cotton T-Shirt', 'Denim Jacket', 'Linen Shirt', 'Joggers', 'Sneakers'],
  Electronics: ['Wireless Earbuds', 'Phone Case', 'USB-C Cable', 'Power Bank', 'Smart Watch'],
  Books: ['Fiction Novel', 'Self-Help Book', 'Cookbook', 'Tech Manual', 'Poetry Collection'],
  Beauty: ['Face Cream', 'Sunscreen SPF50', 'Lip Balm', 'Hair Oil', 'Face Wash'],
  Home: ['Scented Candle', 'Cushion Cover', 'Wall Art', 'Plant Pot', 'Desk Organizer'],
  Fitness: ['Yoga Mat', 'Resistance Band', 'Protein Shaker', 'Jump Rope', 'Foam Roller'],
  Accessories: ['Tote Bag', 'Sunglasses', 'Watch Strap', 'Wallet', 'Keychain'],
};

const channelOptions = ['whatsapp', 'sms', 'email'];

// --- Helpers ---
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo) {
  const now = Date.now();
  return new Date(now - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
}

async function seed() {
  await connectDB();

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Customer.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // --- Generate Customers ---
  console.log('👥 Generating 500+ customers...');
  const customers = [];

  for (let i = 0; i < 520; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const city = pick(cities);
    const age = randomInt(18, 55);
    const totalOrders = randomInt(0, 25);
    const avgOrderValue = randomInt(200, 3000);
    const totalSpent = totalOrders * avgOrderValue;
    const lastOrderDaysAgo = totalOrders === 0 ? null : randomInt(1, 180);

    // Assign behavioral tags
    const tags = [];
    if (totalSpent > 10000) tags.push('vip');
    if (totalOrders > 10) tags.push('frequent');
    if (lastOrderDaysAgo && lastOrderDaysAgo > 90) tags.push('inactive');
    if (age < 30) tags.push('young');
    const topCats = [pick(categories), pick(categories)].filter((v, i, a) => a.indexOf(v) === i);
    topCats.forEach((c) => tags.push(c.toLowerCase()));

    // Generate digital twin data
    const churnRisk = lastOrderDaysAgo
      ? lastOrderDaysAgo > 90 ? 'high' : lastOrderDaysAgo > 45 ? 'medium' : 'low'
      : null;

    customers.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `+91${randomInt(7000000000, 9999999999)}`,
      age,
      city,
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrderDaysAgo ? new Date(Date.now() - lastOrderDaysAgo * 24 * 60 * 60 * 1000) : null,
      tags,
      digitalTwin: {
        purchaseProbability: randomInt(10, 95),
        preferredChannel: pick(channelOptions),
        likelyPurchaseWindow: pick(['Morning', 'Afternoon', 'Evening', 'Weekend', 'Friday Evening', 'Saturday']),
        discountSensitivity: pick(['low', 'medium', 'high']),
        churnRisk,
        lifetimeValuePrediction: totalSpent + randomInt(1000, 15000),
        topCategories: topCats,
        lastUpdated: new Date(),
      },
    });
  }

  const insertedCustomers = await Customer.insertMany(customers);
  console.log(`   ✅ Created ${insertedCustomers.length} customers`);

  // --- Generate Orders ---
  console.log('📦 Generating 2000+ orders...');
  const orders = [];

  for (const customer of insertedCustomers) {
    const numOrders = customer.totalOrders;
    for (let j = 0; j < numOrders; j++) {
      const category = pick(categories);
      const productList = products[category];
      const numItems = randomInt(1, 3);
      const items = [];

      for (let k = 0; k < numItems; k++) {
        items.push({
          name: pick(productList),
          category,
          price: randomInt(100, 2500),
          quantity: randomInt(1, 3),
        });
      }

      const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      orders.push({
        customerId: customer._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount,
        items,
        status: pick(['delivered', 'delivered', 'delivered', 'shipped', 'confirmed']),
        orderDate: randomDate(365),
      });
    }
  }

  // Insert in batches of 500 to avoid memory issues
  for (let i = 0; i < orders.length; i += 500) {
    const batch = orders.slice(i, i + 500);
    await Order.insertMany(batch);
    console.log(`   📦 Inserted orders ${i + 1} to ${Math.min(i + 500, orders.length)}`);
  }

  console.log(`   ✅ Created ${orders.length} orders total`);

  // --- Generate Support Tickets ---
  console.log('🎟️ Generating support tickets...');
  const Ticket = require('./src/models/Ticket');
  await Ticket.deleteMany({});
  
  const tickets = [];
  const subjects = [
    'Order delayed', 'Product quality issue', 'Address change request', 
    'Refund status', 'Need help with account', 'Damaged item received',
    'Payment failed but amount deducted', 'Where is my order?'
  ];

  for (let i = 0; i < 50; i++) {
    const customer = insertedCustomers[i];
    const status = pick(['open', 'in-progress', 'resolved', 'closed']);
    tickets.push({
      ticketNumber: 'TK-' + Math.floor(100000 + Math.random() * 900000),
      customerId: customer._id,
      subject: pick(subjects),
      status: status,
      priority: pick(['low', 'medium', 'high', 'urgent']),
      category: pick(['order', 'product', 'shipping', 'other']),
      messages: [
        {
          sender: 'customer',
          senderName: customer.name,
          content: `Hi, I am facing an issue regarding: ${pick(subjects)}. Please help.`
        }
      ]
    });
  }

  const insertedTickets = await Ticket.insertMany(tickets);
  console.log(`   ✅ Created ${insertedTickets.length} support tickets`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Customers: ${insertedCustomers.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log(`   Tickets: ${insertedTickets.length}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
