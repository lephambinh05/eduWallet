const mongoose = require("mongoose");
require("dotenv").config();

// Ensure MONGODB_URI provided via environment
if (!process.env.MONGODB_URI) {
  console.error(
    "❌ Missing required environment variable: MONGODB_URI. Set it in your .env or environment."
  );
  process.exit(1);
}

// Import models
const User = require("../src/models/User");
const SimpleCertificate = require("../src/models/SimpleCertificate");
const SimpleBadge = require("../src/models/SimpleBadge");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const importCertificates = async (userId) => {
  try {
    console.log("🏆 Importing Certificate data...");

    const certificates = [
      {
        title: "Google Cloud Professional Data Engineer",
        description:
          "Chứng chỉ chuyên nghiệp về kỹ sư dữ liệu trên Google Cloud Platform",
        issuer: "Google Cloud",
        issueDate: "2024-01-15",
        category: "Cloud Computing",
        level: "Professional",
        score: 95,
        verificationUrl: "https://www.credential.net/abc123google",
        // imageUrl removed
      },
      {
        title: "Machine Learning Specialization Certificate",
        description:
          "Chứng chỉ hoàn thành chuyên ngành Machine Learning từ Stanford",
        issuer: "Coursera - Stanford University",
        issueDate: "2024-02-20",
        category: "Machine Learning",
        level: "Advanced",
        score: 92,
        verificationUrl: "https://www.coursera.org/verify/xyz456stanford",
        // imageUrl removed
      },
      {
        title: "Web Development Bootcamp Certificate",
        description: "Chứng chỉ hoàn thành khóa học phát triển web toàn diện",
        issuer: "Udemy",
        issueDate: "2024-03-10",
        category: "Web Development",
        level: "Intermediate",
        score: 98,
        verificationUrl: "https://www.udemy.com/certificate/def789udemy",
        // imageUrl removed
      },
      {
        title: "IELTS Academic Certificate",
        description: "Chứng chỉ IELTS Academic với điểm số 8.5",
        issuer: "British Council",
        issueDate: "2023-11-01",
        category: "Language",
        level: "Advanced",
        score: 8.5,
        verificationUrl: "https://ielts.org/verify/ghi012ielts",
        // imageUrl removed
      },
      {
        title: "Blockchain Development Certificate",
        description:
          "Chứng chỉ phát triển ứng dụng blockchain và smart contracts",
        issuer: "Udemy",
        issueDate: "2024-04-05",
        category: "Blockchain",
        level: "Intermediate",
        score: 89,
        verificationUrl: "https://www.udemy.com/certificate/jkl345blockchain",
        // imageUrl removed
      },
    ];

    let importedCount = 0;

    for (const certData of certificates) {
      // Check if Certificate already exists
      const existingCert = await SimpleCertificate.findOne({
        userId: userId,
        title: certData.title,
      });

      if (existingCert) {
        console.log(
          `⚠️  Certificate "${certData.title}" already exists, updating...`
        );

        // Update existing Certificate
        await SimpleCertificate.findOneAndUpdate(
          { userId: userId, title: certData.title },
          {
            ...certData,
            userId: userId,
            updatedAt: new Date(),
          },
          { new: true }
        );
      } else {
        // Create new Certificate
        const newCert = new SimpleCertificate({
          ...certData,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newCert.save();
        importedCount++;
      }
    }

    console.log(
      `✅ Imported ${importedCount} new Certificates, updated existing ones`
    );
  } catch (error) {
    console.error("❌ Error importing Certificates:", error);
    throw error;
  }
};

const importBadges = async (userId) => {
  try {
    console.log("🎖️  Importing Badge data...");

    const badges = [
      {
        title: "Early Bird Learner",
        description: "Hoàn thành khóa học trước thời hạn",
        issuer: "EduWallet",
        earnedDate: "2024-01-01",
        category: "Achievement",
        level: "Beginner",
        points: 50,
        rarity: "Common",
        // iconUrl removed
      },
      {
        title: "Top Coder",
        description: "Đạt điểm cao trong các bài kiểm tra lập trình",
        issuer: "EduWallet",
        earnedDate: "2024-03-15",
        category: "Skill",
        level: "Intermediate",
        points: 75,
        rarity: "Uncommon",
        // iconUrl removed
      },
      {
        title: "Cloud Master",
        description: "Hoàn thành chứng chỉ Google Cloud Professional",
        issuer: "EduWallet",
        earnedDate: "2024-01-15",
        category: "Professional",
        level: "Advanced",
        points: 100,
        rarity: "Rare",
        // iconUrl removed
      },
      {
        title: "Language Expert",
        description: "Đạt điểm IELTS 8.5",
        issuer: "EduWallet",
        earnedDate: "2023-11-01",
        category: "Language",
        level: "Expert",
        points: 150,
        rarity: "Epic",
        // iconUrl removed
      },
      {
        title: "Blockchain Pioneer",
        description: "Hoàn thành khóa học blockchain development",
        issuer: "EduWallet",
        earnedDate: "2024-04-05",
        category: "Skill",
        level: "Intermediate",
        points: 80,
        rarity: "Uncommon",
        // iconUrl removed
      },
      {
        title: "Perfect Score",
        description: "Đạt điểm tuyệt đối trong khóa học Web Development",
        issuer: "EduWallet",
        earnedDate: "2024-03-10",
        category: "Achievement",
        level: "Advanced",
        points: 200,
        rarity: "Legendary",
        // iconUrl removed
      },
    ];

    let importedCount = 0;

    for (const badgeData of badges) {
      // Check if Badge already exists
      const existingBadge = await SimpleBadge.findOne({
        userId: userId,
        title: badgeData.title,
      });

      if (existingBadge) {
        console.log(
          `⚠️  Badge "${badgeData.title}" already exists, updating...`
        );

        // Update existing Badge
        await SimpleBadge.findOneAndUpdate(
          { userId: userId, title: badgeData.title },
          {
            ...badgeData,
            userId: userId,
            updatedAt: new Date(),
          },
          { new: true }
        );
      } else {
        // Create new Badge
        const newBadge = new SimpleBadge({
          ...badgeData,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newBadge.save();
        importedCount++;
      }
    }

    console.log(
      `✅ Imported ${importedCount} new Badges, updated existing ones`
    );
  } catch (error) {
    console.error("❌ Error importing Badges:", error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log("🚀 Starting certificates and badges import...");

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: "lephambinh05@gmail.com" });
    if (!user) {
      console.log("❌ User lephambinh05@gmail.com not found");
      return;
    }

    console.log(`👤 Found user: ${user.email}`);

    // Import certificates and badges
    await importCertificates(user._id);
    await importBadges(user._id);

    console.log("🎉 Certificates and badges import completed successfully!");
  } catch (error) {
    console.error("💥 Import failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the import
main();
