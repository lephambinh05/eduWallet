import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  console.log("📘 Enroll student:", req.body);
  res.json({
    success: true,
    message: "Enrollment recorded successfully.",
  });
});

export default router;
