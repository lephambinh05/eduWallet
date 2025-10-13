// Simple import script
const fs = require('fs');
const mongoose = require('mongoose');

console.log('🚀 Starting data import...');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduwallet')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Read data
    const data = JSON.parse(fs.readFileSync('./portfolio-data.json', 'utf8'));
    console.log('📄 Data loaded from JSON file');
    
    // Simple schemas
    const userSchema = new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String
    });
    
    const courseSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      courseName: String,
      grade: String,
      gpa: Number,
      semester: String
    });
    
    const certificateSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      title: String,
      issuer: String,
      issueDate: Date,
      category: String,
      score: Number,
      gpa: Number
    });
    
    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Certificate = mongoose.model('Certificate', certificateSchema);
    
    // Import data
    async function importData() {
      try {
        // Find or create user
        let user = await User.findOne({ email: data.user.email });
        if (!user) {
          user = new User(data.user);
          await user.save();
          console.log('✅ Created user:', user.email);
        } else {
          console.log('✅ Found user:', user.email);
        }
        
        // Clear existing data
        await Course.deleteMany({ userId: user._id });
        await Certificate.deleteMany({ userId: user._id });
        console.log('🧹 Cleared existing data');
        
        // Insert courses
        const courses = data.courses.map(course => ({
          ...course,
          userId: user._id
        }));
        await Course.insertMany(courses);
        console.log('✅ Inserted', courses.length, 'courses');
        
        // Insert certificates
        const certificates = data.certificates.map(cert => ({
          ...cert,
          userId: user._id,
          issueDate: new Date(cert.issueDate)
        }));
        await Certificate.insertMany(certificates);
        console.log('✅ Inserted', certificates.length, 'certificates');
        
        console.log('🎉 Data import completed successfully!');
        
      } catch (error) {
        console.error('❌ Error:', error.message);
      } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
      }
    }
    
    importData();
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });
