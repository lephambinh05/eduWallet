import express from "express";
const router = express.Router();

router.get("/:certificateId", (req, res) => {
  const { certificateId } = req.params;

  res.json({
    success: true,
    data: {
      valid: true,
      certificateId,
      studentName: "Nguyen Van A",
      courseName: "Mixed Learning",
      issuedAt: "2025-10-29T10:00:00Z",
      grade: "A",
      verificationUrl: `https://partner.com/verify/${certificateId}`,
    },
  });
});

export default router;
