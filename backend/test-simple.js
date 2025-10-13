console.log('🚀 Test script starting...');

const mongoose = require('mongoose');

console.log('📦 Mongoose loaded');

mongoose.connect('mongodb://localhost:27017/eduwallet')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Simple schema
    const userSchema = new mongoose.Schema({
      email: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Find user
    User.findOne({ email: 'lephambinh05@gmail.com' })
      .then(user => {
        if (user) {
          console.log('✅ User found:', user.email);
        } else {
          console.log('❌ User not found');
        }
        mongoose.connection.close();
      })
      .catch(err => {
        console.error('❌ Error finding user:', err.message);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });
