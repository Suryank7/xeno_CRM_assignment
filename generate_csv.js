const fs = require('fs');

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rohan', 'Kabir', 'Ananya', 'Diya', 'Isha', 'Meera', 'Neha', 'Priya', 'Riya', 'Sneha', 'Lalit', 'Shreya', 'Tanvi', 'Deepika'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Desai', 'Joshi', 'Kapoor', 'Bhat', 'Deshmukh', 'Menon'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Chandigarh'];
const tagOptions = ['vip', 'frequent', 'inactive', 'young', 'electronics', 'apparel', 'grocery', 'deal-hunter', 'loyal', 'churn-risk'];

const generateRow = (i) => {
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const email = `${name.replace(' ', '.').toLowerCase()}${i}@example.com`;
  const phone = `9${Math.floor(Math.random() * 900000000) + 100000000}`;
  const age = Math.floor(Math.random() * 40) + 18;
  const city = cities[Math.floor(Math.random() * cities.length)];
  const totalOrders = Math.floor(Math.random() * 50);
  const totalSpent = totalOrders * (Math.floor(Math.random() * 2000) + 500);
  
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 120);
  const lastOrderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  
  const numTags = Math.floor(Math.random() * 3) + 1;
  const tags = [];
  for(let j=0; j<numTags; j++) {
    const t = tagOptions[Math.floor(Math.random() * tagOptions.length)];
    if(!tags.includes(t)) tags.push(t);
  }

  return `"${name}","${email}","${phone}",${age},"${city}",${totalOrders},${totalSpent},"${lastOrderDate}","${tags.join(', ')}"`;
};

const rows = ['Name,Email,Phone,Age,City,Total Orders,Total Spent,Last Order Date,Tags'];
for (let i = 0; i < 600; i++) {
  rows.push(generateRow(i));
}

fs.writeFileSync('C:\\Users\\lalit\\Desktop\\Xeno\\customers_demo.csv', rows.join('\n'));
console.log('Successfully generated 600 records at C:\\Users\\lalit\\Desktop\\Xeno\\customers_demo.csv');
