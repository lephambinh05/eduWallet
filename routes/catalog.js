import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      courses: [
        {
          courseId: "partner_course_video",
          title: "Video Learning Basics",
          description: "Khóa học qua video YouTube",
          category: "Education",
          duration: 10,
          price: 0,
          language: "vi",
          instructor: {
            name: "Nguyen Tam An",
            bio: "Fullstack Dev & Mentor",
            avatar: "https://partner.com/avatar.jpg",
          },
          isActive: true,
          lastUpdated: new Date().toISOString(),
        },
        {
          courseId: "partner_course_quiz",
          title: "Quiz Learning Basics",
          description: "Khóa học qua bài trắc nghiệm",
          category: "Education",
          duration: 5,
          price: 0,
          language: "vi",
          instructor: {
            name: "Nguyen Tam An",
            bio: "Fullstack Dev & Mentor",
            avatar: "https://partner.com/avatar.jpg",
          },
          isActive: true,
          lastUpdated: new Date().toISOString(),
        },
        {
          courseId: "partner_course_mix",
          title: "Mixed Learning (Video + Quiz)",
          description: "Học kết hợp xem video và làm quiz",
          category: "Education",
          duration: 15,
          price: 0,
          language: "vi",
          instructor: {
            name: "Nguyen Tam An",
            bio: "Fullstack Dev & Mentor",
            avatar: "https://partner.com/avatar.jpg",
          },
          isActive: true,
          lastUpdated: new Date().toISOString(),
        },
      ],
    },
  });
});

export default router;
