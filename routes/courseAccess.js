import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { courseId, studentId, validUntil } = req.body;
  console.log("📩 Course access request:", req.body);

  // Tạo access link cho học viên
  const accessLink = `https://partner.com/course/${courseId}?student=${studentId}&token=xyz123`;

  res.json({
    success: true,
    data: {
      accessLink,
      validUntil,
      instructions: "Nhấp vào link để bắt đầu học khóa của bạn.",
    },
  });
});

export default router;
