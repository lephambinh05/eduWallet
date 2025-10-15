const Joi = require('joi');

const updatePurchaserSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  avatar: Joi.string().uri().optional()
});

exports.updatePurchaser = (req, res, next) => {
  const { error } = updatePurchaserSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};
