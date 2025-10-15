const express = require('express');
const router = express.Router();
const controller = require('../controllers/partnerController');
const validate = require('../validation/partnerValidation');

// Use existing authorize middleware from backend
const { authorize } = require('../../src/middleware/auth');

// All routes require partner role
router.get('/purchasers', authorize('partner'), controller.listPurchasers);
router.get('/purchasers/:id', authorize('partner'), controller.getPurchaser);
router.patch('/purchasers/:id', authorize('partner'), validate.updatePurchaser, controller.updatePurchaser);
router.get('/courses', authorize('partner'), controller.listCourses);

module.exports = router;
