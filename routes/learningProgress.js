import express from "express";
const router = express.Router();

// Dữ liệu mô phỏng lưu trong bộ nhớ
const fakeProgress = {
  test_student_001: {
    test_course_001: {
      progress: {
        completionPercentage: 100,
        totalTimeSpent: 3800,
        lastAccessed: new Date().toISOString(),
        startDate: "2025-10-01T09:00:00Z",
      },
      scores: {
        totalPoints: 900,
        maxPoints: 1000,
        averageScore: 90,
        assessments: [
          {
            type: "quiz",
            name: "Quiz Chapter 1",
            score: 85,
            maxScore: 100,
            completedAt: "2025-10-25T15:00:00Z",
          },
          {
            type: "assignment",
            name: "Final Project",
            score: 95,
            maxScore: 100,
            completedAt: "2025-10-28T16:00:00Z",
          },
        ],
      },
      certificate: {
        issued: true,
        issuedAt: "2025-10-29T09:00:00Z",
        certificateUrl: "https://partner.com/certificates/cert_123.pdf",
        grade: "A",
        creditsEarned: 3,
      },
    },
  },
};

router.get("/:studentId/:courseId", (req, res) => {
  const { studentId, courseId } = req.params;
  const data = fakeProgress[studentId]?.[courseId];

  if (!data) {
    return res.status(404).json({
      success: false,
      error: {
        code: "STUDENT_NOT_FOUND",
        message: `Student ${studentId} not found in course ${courseId}`,
      },
    });
  }

  res.json({
    success: true,
    data: {
      studentId,
      courseId,
      ...data,
    },
  });
});

export default router;
