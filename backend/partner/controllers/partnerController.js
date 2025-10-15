const CoursePurchase = require('../models/CoursePurchase');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');

// List purchasers for logged-in partner (instructor)
exports.listPurchasers = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const purchases = await CoursePurchase.find({ instructorId })
      .populate('userId', '-password')
      .populate('courseId');

    res.json({ success: true, data: purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPurchaser = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    const purchase = await CoursePurchase.findOne({ _id: id, instructorId })
      .populate('userId', '-password')
      .populate('courseId');

    if (!purchase) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Patch limited user info for purchaser (only certain fields)
exports.updatePurchaser = async (req, res) => {
  try {
    const { id } = req.params; // purchase id
    const instructorId = req.user._id;
    const allowed = ['firstName', 'lastName', 'phone', 'avatar'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const purchase = await CoursePurchase.findOne({ _id: id, instructorId });
    if (!purchase) return res.status(404).json({ success: false, message: 'Not found' });

    // update user
    const user = await User.findById(purchase.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(user, updates);
    await user.save();

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// List courses owned by partner
exports.listCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({ userId: instructorId });
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
