const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('✅ Connected to MongoDB\n');

  try {
    // Check Enrollments
    const enrollments = await mongoose.connection.db.collection('enrollments')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('📚 Latest 5 Enrollments:');
    console.log('='.repeat(80));
    enrollments.forEach((e, i) => {
      console.log(`${i + 1}. Course: ${e.courseTitle}`);
      console.log(`   User: ${e.user}`);
      console.log(`   Progress: ${e.progressPercent}%`);
      console.log(`   Status: ${e.status}`);
      console.log(`   Created: ${e.createdAt}`);
      console.log(`   Time Spent: ${e.timeSpentSeconds}s`);
      console.log('');
    });

    // Check Purchases
    const purchases = await mongoose.connection.db.collection('purchases')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('\n💰 Latest 5 Purchases:');
    console.log('='.repeat(80));
    purchases.forEach((p, i) => {
      console.log(`${i + 1}. Item ID: ${p.itemId}`);
      console.log(`   Buyer: ${p.buyer}`);
      console.log(`   Seller: ${p.seller}`);
      console.log(`   Price: ${p.price} EDU`);
      console.log(`   Created: ${p.createdAt}`);
      console.log('');
    });

    // Check CompletedCourses
    const completedCourses = await mongoose.connection.db.collection('completedcourses')
      .find({})
      .sort({ issueDate: -1 })
      .limit(5)
      .toArray();
    
    console.log('\n🎓 Latest 5 Completed Courses:');
    console.log('='.repeat(80));
    completedCourses.forEach((c, i) => {
      console.log(`${i + 1}. Course: ${c.name}`);
      console.log(`   User: ${c.userId}`);
      console.log(`   Issuer: ${c.issuer}`);
      console.log(`   Score: ${c.score}/100`);
      console.log(`   Grade: ${c.grade}`);
      console.log(`   Issued: ${c.issueDate}`);
      console.log('');
    });

    // Summary
    const totalEnrollments = await mongoose.connection.db.collection('enrollments').countDocuments();
    const totalPurchases = await mongoose.connection.db.collection('purchases').countDocuments();
    const totalCompleted = await mongoose.connection.db.collection('completedcourses').countDocuments();

    console.log('\n📊 Database Summary:');
    console.log('='.repeat(80));
    console.log(`Total Enrollments: ${totalEnrollments}`);
    console.log(`Total Purchases: ${totalPurchases}`);
    console.log(`Total Completed Courses: ${totalCompleted}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
});
