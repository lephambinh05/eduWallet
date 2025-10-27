const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");
const Badge = require("../models/Badge");
const SimpleCertificate = require("../models/SimpleCertificate");
const SimpleBadge = require("../models/SimpleBadge");
const LearnPass = require("../models/LearnPass");
const PortfolioChange = require("../models/PortfolioChange");

// Create a portfolio change record (audit log)
router.post("/changes", async (req, res) => {
  try {
    const { userId, tokenId, changeType, diff, meta } = req.body;
    if (!userId || !changeType) {
      return res
        .status(400)
        .json({
          success: false,
          message: "userId and changeType are required",
        });
    }

    const change = new PortfolioChange({
      userId,
      tokenId: tokenId || null,
      changeType,
      diff: diff || {},
      meta: meta || {},
    });

    await change.save();

    res.json({ success: true, data: change });
  } catch (error) {
    console.error("Error creating portfolio change:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
});

// Get change history for a user (paginated)
router.get("/:userId/changes", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const query = { userId };
    if (req.query.tokenId) query.tokenId = req.query.tokenId;

    const changes = await PortfolioChange.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await PortfolioChange.countDocuments(query);

    res.json({ success: true, data: { changes, page, limit, total } });
  } catch (error) {
    console.error("Error fetching portfolio changes:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
});

// Get user portfolio data
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get Courses
    const courses = await Course.find({ userId }).catch(() => []);

    // Get Certificates
    const certificates = await Certificate.find({ userId }).catch(() => []);

    // Get Badges
    const badges = await Badge.find({ userId }).catch(() => []);

    // Calculate statistics
    const courseStats = {
      totalCourses: courses.length,
      averageScore:
        courses.length > 0
          ? Math.round(
              courses.reduce((sum, course) => sum + (course.score || 0), 0) /
                courses.length
            )
          : 0,
      completionRate:
        courses.length > 0
          ? Math.round(
              (courses.filter((c) => c.status === "Completed").length /
                courses.length) *
                100
            )
          : 0,
    };

    const certificateStats = {
      totalCertificates: certificates.length,
      certificatesThisMonth: certificates.filter((c) => {
        const certDate = new Date(c.createdAt);
        const now = new Date();
        return (
          certDate.getMonth() === now.getMonth() &&
          certDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    const badgeStats = {
      totalBadges: badges.length,
      badgesThisWeek: badges.filter((b) => {
        const badgeDate = new Date(b.createdAt);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return badgeDate >= weekAgo;
      }).length,
    };

    // Calculate overall statistics
    const statistics = {
      totalCourses: courseStats.totalCourses,
      totalCertificates: certificateStats.totalCertificates,
      totalBadges: badgeStats.totalBadges,
      gpa: user.academicInfo?.gpa || 0,
      totalCredits: user.academicInfo?.totalCredits || 0,
      completedCredits: user.academicInfo?.completedCredits || 0,
      averageScore: courseStats.averageScore,
      completionRate: courseStats.completionRate,
      learningStreak: user.stats?.learningStreak || 0,
      totalStudyHours: user.stats?.totalStudyHours || 0,
      certificatesThisMonth: certificateStats.certificatesThisMonth,
      badgesThisWeek: badgeStats.badgesThisWeek,
      topSkills: [],
      achievements: [],
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          studentId: user.studentId,
          academicInfo: user.academicInfo,
        },
        courses,
        certificates,
        badges,
        statistics,
      },
    });
  } catch (error) {
    console.error("Error getting portfolio data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get portfolio data by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Get user by email
    const user = await User.findOne({ email }).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get portfolio data directly instead of redirecting
    const userId = user._id;

    // Get Courses
    const courses = await Course.find({ userId }).catch(() => []);

    // Get Certificates (try SimpleCertificate first, fallback to Certificate)
    let certificates = [];
    try {
      certificates = await SimpleCertificate.find({ userId });
      console.log(
        "✅ Found",
        certificates.length,
        "SimpleCertificates for user:",
        email
      );
    } catch (error) {
      try {
        certificates = await Certificate.find({ userId });
        console.log(
          "✅ Found",
          certificates.length,
          "Certificates for user:",
          email
        );
      } catch (error2) {
        certificates = [];
        console.log("⚠️ No certificates found for user:", email);
      }
    }

    // Get Badges (try SimpleBadge first, fallback to Badge)
    let badges = [];
    try {
      badges = await SimpleBadge.find({ userId });
      console.log("✅ Found", badges.length, "SimpleBadges for user:", email);
    } catch (error) {
      try {
        badges = await Badge.find({ userId });
        console.log("✅ Found", badges.length, "Badges for user:", email);
      } catch (error2) {
        badges = [];
        console.log("⚠️ No badges found for user:", email);
      }
    }

    // Calculate statistics
    const statistics = {
      totalCourses: courses.length,
      totalCertificates: certificates.length,
      totalBadges: badges.length,
      gpa: user.academicInfo?.gpa || 0,
      totalCredits: user.academicInfo?.totalCredits || 0,
      completedCredits: user.academicInfo?.completedCredits || 0,
      averageScore:
        courses.length > 0
          ? Math.round(
              courses.reduce((sum, course) => sum + (course.score || 0), 0) /
                courses.length
            )
          : 0,
      completionRate:
        courses.length > 0
          ? Math.round(
              (courses.filter((c) => c.status === "Completed").length /
                courses.length) *
                100
            )
          : 0,
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          studentId: user.studentId,
          academicInfo: user.academicInfo,
        },
        courses,
        certificates,
        badges,
        statistics,
      },
    });
  } catch (error) {
    console.error("Error getting portfolio by email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get LearnPasses for user
router.get("/:userId/learnpasses", async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, status } = req.query;

    let query = { userId, isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const learnPasses = await LearnPass.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: learnPasses,
    });
  } catch (error) {
    console.error("Error getting LearnPasses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get Certificates for user
router.get("/:userId/certificates", async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, issuer } = req.query;

    let query = { userId, isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (issuer && issuer !== "all") {
      query.issuer = issuer;
    }

    const certificates = await Certificate.find(query).sort({ issueDate: -1 });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Error getting Certificates:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get Badges for user
router.get("/:userId/badges", async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, rarity } = req.query;

    let query = { userId, isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (rarity && rarity !== "all") {
      query.rarity = rarity;
    }

    const badges = await Badge.find(query).sort({ earnedDate: -1 });

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error("Error getting Badges:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get portfolio statistics
router.get("/:userId/statistics", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const learnPassStats = await LearnPass.getUserStats(userId);
    const certificateStats = await Certificate.getUserStats(userId);
    const badgeStats = await Badge.getUserBadgeStats(userId);

    const statistics = {
      totalLearnPasses: learnPassStats.totalLearnPasses,
      totalCertificates: certificateStats.totalCertificates,
      totalBadges: badgeStats.totalBadges,
      gpa: user.academicInfo?.gpa || 0,
      totalCredits: user.academicInfo?.totalCredits || 0,
      completedCredits: user.academicInfo?.completedCredits || 0,
      averageScore: learnPassStats.averageScore || 0,
      completionRate: learnPassStats.completionRate || 0,
      learningStreak: user.statistics?.learningStreak || 0,
      totalStudyHours: user.statistics?.totalStudyHours || 0,
      certificatesThisMonth: certificateStats.certificatesThisMonth || 0,
      badgesThisWeek: badgeStats.badgesThisWeek || 0,
      topSkills: learnPassStats.topSkills || [],
      achievements: badgeStats.achievements || [],
    };

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
