const mongoose = require('mongoose');

const coursePurchaseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purchaseDate: { type: Date, default: Date.now },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'completed' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CoursePurchase', coursePurchaseSchema);
