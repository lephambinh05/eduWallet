const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function deleteNullScores() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all CompletedCourses with null score
    const result = await CompletedCourse.deleteMany({ score: null });
    
    console.log(`🗑️  Deleted ${result.deletedCount} CompletedCourses with null score`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteNullScores();
