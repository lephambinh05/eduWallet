const mongoose = require("mongoose");
const Course = require("../src/models/Course");
const Certificate = require("../src/models/Certificate");
const Badge = require("../src/models/Badge");
const User = require("../src/models/User");
const Institution = require("../src/models/Institution");
const Portfolio = require("../src/models/Portfolio");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://160.30.112.42:27017/eduwallet";

async function insertData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const userId = "6912096e151af9f7c68c3db8";
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const studentAddress =
      user.walletAddress || "0x34ABc2b061f0d6c24c0786863Cbbd1dAdf7A1c89"; // From context

    // Find or create institution
    let institution = await Institution.findOne({
      name: "Trường Đại Học Ngoại Ngữ - Tin Học Thành Phố Hồ Chí Minh",
    });
    if (!institution) {
      institution = new Institution({
        name: "Trường Đại Học Ngoại Ngữ - Tin Học Thành Phố Hồ Chí Minh",
        institutionId: "HUFLIT",
        email: "info@huflit.edu.vn",
        website: "https://huflit.edu.vn",
        address: {
          city: "Thành phố Hồ Chí Minh",
          country: "Việt Nam",
        },
        type: "university",
        level: "undergraduate",
        createdBy: userId,
      });
      await institution.save();
      console.log("Created institution: HUFLIT");
    }

    // Sample courses from HUFLIT
    const coursesData = [
      {
        title: "Tiếng Anh Cơ Bản 1",
        description: "Khóa học nền tảng tiếng Anh cho sinh viên HUFLIT",
        link: "https://huflit.edu.vn/course/english-basic-1",
        priceEdu: 100,
      },
      {
        title: "Lập Trình Java",
        description: "Khóa học lập trình Java cho sinh viên CNTT",
        link: "https://huflit.edu.vn/course/java-programming",
        priceEdu: 200,
      },
      {
        title: "Kinh Tế Vi Mô",
        description: "Nguyên lý kinh tế vi mô ứng dụng",
        link: "https://huflit.edu.vn/course/microeconomics",
        priceEdu: 150,
      },
      {
        title: "Marketing Số",
        description: "Chiến lược marketing trong kỷ nguyên số",
        link: "https://huflit.edu.vn/course/digital-marketing",
        priceEdu: 180,
      },
      {
        title: "Ngôn Ngữ Pháp",
        description: "Khóa học tiếng Pháp sơ cấp",
        link: "https://huflit.edu.vn/course/french-language",
        priceEdu: 120,
      },
      {
        title: "Cơ Sở Dữ Liệu",
        description: "Thiết kế và quản trị cơ sở dữ liệu",
        link: "https://huflit.edu.vn/course/database-fundamentals",
        priceEdu: 160,
      },
      {
        title: "Kỹ Năng Mềm",
        description: "Phát triển kỹ năng giao tiếp và làm việc nhóm",
        link: "https://huflit.edu.vn/course/soft-skills",
        priceEdu: 90,
      },
      {
        title: "Thiết Kế Đồ Họa",
        description: "Sử dụng Photoshop và Illustrator",
        link: "https://huflit.edu.vn/course/graphic-design",
        priceEdu: 220,
      },
      {
        title: "Quản Trị Doanh Nghiệp",
        description: "Nguyên tắc quản trị hiện đại",
        link: "https://huflit.edu.vn/course/business-management",
        priceEdu: 170,
      },
      {
        title: "Tiếng Trung Thương Mại",
        description: "Tiếng Trung cho kinh doanh",
        link: "https://huflit.edu.vn/course/business-chinese",
        priceEdu: 140,
      },
    ];

    const courses = [];
    for (const courseData of coursesData) {
      const course = new Course({
        owner: userId,
        ...courseData,
      });
      await course.save();
      courses.push(course);
      console.log(`Inserted course: ${course.title}`);
    }

    // Certificates - commented out to avoid duplicates
    /*
    const certificatesData = courses.map((course, index) => ({
      tokenId: 4000 + index,
      certificateId: `CERT-${userId.slice(-6)}-${Date.now()}-${index + 1}`,
      student: userId,
      studentAddress,
      courseName: course.title,
      courseCode: `HUFLIT-${index + 1}`,
      courseDescription: course.description,
      institutionName:
        "Trường Đại Học Ngoại Ngữ - Tin Học Thành Phố Hồ Chí Minh",
      issuer: institution._id,
      issuerName: institution.name,
      issueDate: new Date(),
      completionDate: new Date(),
      gradeOrScore: ["A", "B+", "A-", "B", "A+"][index % 5],
      credits: Math.floor(Math.random() * 3) + 1,
      certificateURI: `https://huflit.edu.vn/certificates/${`CERT-${userId.slice(
        -6
      )}-${index + 1}`}.pdf`,
      tokenURI: `https://api-eduwallet.mojistudio.vn/api/certificates/metadata/${
        1000 + index
      }`,
      contractAddress: "0x1234567890123456789012345678901234567890",
      blockNumber: 12345 + index,
      transactionHash: `0x${"a".repeat(64)}`,
    }));

    for (const certData of certificatesData) {
      const certificate = new Certificate(certData);
      await certificate.save();
      console.log(`Inserted certificate: ${certificate.certificateId}`);
    }
    */

    // Badges - commented out
    /*
    const badgesData = [
      {
        name: "Sinh Viên Xuất Sắc",
        description: "Huy hiệu cho sinh viên có thành tích học tập xuất sắc",
      },
      {
        name: "Hoàn Thành Khóa Học",
        description: "Huy hiệu cho việc hoàn thành khóa học đầu tiên",
      },
      {
        name: "Tham Gia Hoạt Động",
        description: "Huy hiệu cho sự tham gia tích cực trong các hoạt động",
      },
      {
        name: "Kỹ Năng Lãnh Đạo",
        description: "Huy hiệu cho kỹ năng lãnh đạo và quản lý",
      },
      {
        name: "Đổi Mới Sáng Tạo",
        description: "Huy hiệu cho tinh thần đổi mới và sáng tạo",
      },
      {
        name: "Học Tập Liên Tục",
        description: "Huy hiệu cho cam kết học tập suốt đời",
      },
      {
        name: "Giao Tiếp Xuất Sắc",
        description: "Huy hiệu cho kỹ năng giao tiếp",
      },
      {
        name: "Công Nghệ Số",
        description: "Huy hiệu cho thành thạo công nghệ số",
      },
      {
        name: "Đạo Đức Nghề Nghiệp",
        description: "Huy hiệu cho đạo đức và chuyên nghiệp",
      },
      {
        name: "Đóng Góp Cộng Đồng",
        description: "Huy hiệu cho đóng góp xã hội",
      },
    ];

    for (const badgeData of badgesData) {
      const badge = new Badge({
        ...badgeData,
        studentAddress,
        issuerAddress: "0x1234567890123456789012345678901234567890", // Dummy issuer
        createdBy: userId,
        earnedDate: new Date(),
      });
      await badge.save();
      console.log(`Inserted badge: ${badge.name}`);
    }
    */

    // Portfolios
    const portfoliosData = [
      {
        title: "Dự Án Lập Trình Java",
        description:
          "Dự án cuối khóa Lập Trình Java tại HUFLIT, xây dựng ứng dụng quản lý sinh viên.",
        projectHash: "hash123",
        projectUrl: "https://github.com/user/java-project",
      },
      {
        title: "Website Marketing Số",
        description:
          "Dự án thực tế về marketing số, tạo landing page cho doanh nghiệp.",
        projectHash: "hash456",
        projectUrl: "https://github.com/user/digital-marketing-site",
      },
      {
        title: "Ứng Dụng Thiết Kế Đồ Họa",
        description: "Bộ sưu tập thiết kế đồ họa cho các khóa học tại HUFLIT.",
        projectHash: "hash789",
        projectUrl: "https://github.com/user/graphic-design-portfolio",
      },
      {
        title: "Nghiên Cứu Kinh Tế Vi Mô",
        description:
          "Báo cáo nghiên cứu về kinh tế vi mô ứng dụng trong doanh nghiệp.",
        projectHash: "hash101",
        projectUrl: "https://github.com/user/microeconomics-research",
      },
      {
        title: "Dịch Thuật Tiếng Trung",
        description:
          "Dự án dịch thuật tài liệu thương mại từ tiếng Trung sang tiếng Việt.",
        projectHash: "hash202",
        projectUrl: "https://github.com/user/chinese-translation",
      },
    ];

    for (const portfolioData of portfoliosData) {
      const portfolio = new Portfolio({
        ...portfolioData,
        owner: studentAddress,
        createdBy: userId,
      });
      await portfolio.save();
      console.log(`Inserted portfolio: ${portfolio.title}`);
    }
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

insertData();
