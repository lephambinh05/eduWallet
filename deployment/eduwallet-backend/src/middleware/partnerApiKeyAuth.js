const Partner = require("../models/Partner");
const { AppError } = require("./errorHandler");

// Middleware to authenticate partner by API key supplied in one of:
// - query param: ?apikey=...
// - header: x-api-key
// - body.apikey
const authenticatePartnerApiKey = async (req, res, next) => {
  try {
    const apikey =
      (req.headers && (req.headers["x-api-key"] || req.headers["x-api_key"])) ||
      req.query?.apikey ||
      req.body?.apikey;

    if (!apikey) return next(new AppError("API key required", 401));

    const partner = await Partner.findOne({ apiKey: String(apikey) });
    if (!partner) return next(new AppError("Invalid API key", 401));

    if (partner.status !== "active")
      return next(new AppError("Partner inactive", 403));

    // attach partner to request for downstream handlers
    req.partner = partner;
    // update last-used timestamp (best-effort)
    try {
      partner.apiKeyLastUsedAt = new Date();
      // do not await too long; fire-and-forget
      partner.save().catch(() => {});
    } catch (e) {
      // ignore
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticatePartnerApiKey };
