import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  console.log("📨 Webhook từ EduWallet:", req.body);
  res.status(200).json({ success: true, received: true });
});

export default router;
