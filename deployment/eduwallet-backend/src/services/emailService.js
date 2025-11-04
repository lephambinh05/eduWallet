const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  async init() {
    try {
      // Cấu hình SMTP transporter
      // nodemailer API: use createTransport (not createTransporter)
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await this.transporter.verify();
        this.isConfigured = true;
        console.log("✅ Email service configured successfully");
      } else {
        console.log("⚠️ Email service not configured (missing credentials)");
      }
    } catch (error) {
      console.log("❌ Email service configuration failed:", error.message);
    }
  }

  // Gửi email welcome khi đăng ký
  async sendWelcomeEmail(to, userData) {
    const subject = "🎉 Chào mừng bạn đến với EduWallet!";
    const template = await this.loadTemplate("welcome", {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Gửi email xác thực tài khoản
  async sendVerificationEmail(to, verificationToken, userData) {
    const subject = "📧 Xác thực tài khoản EduWallet";
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const template = await this.loadTemplate("verification", {
      firstName: userData.firstName,
      verificationUrl,
      expiryHours: 24,
    });

    return this.sendEmail(to, subject, template);
  }

  // Gửi email reset password
  async sendPasswordResetEmail(to, resetToken, userData) {
    const subject = "🔐 Đặt lại mật khẩu EduWallet";
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const template = await this.loadTemplate("password-reset", {
      firstName: userData.firstName,
      resetUrl,
      expiryMinutes: 10,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo khi mua course thành công
  async sendCoursePurchaseNotification(to, courseData, purchaseData) {
    const subject = `🎓 Xác nhận mua khóa học: ${courseData.name}`;

    const template = await this.loadTemplate("course-purchase", {
      firstName: purchaseData.buyer.firstName,
      courseName: courseData.name,
      coursePrice: courseData.priceEdu,
      sellerName: courseData.owner.firstName + " " + courseData.owner.lastName,
      accessLink: purchaseData.accessLink,
      purchaseDate: new Date(purchaseData.createdAt).toLocaleDateString(
        "vi-VN"
      ),
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo cho seller khi có người mua course
  async sendNewSaleNotification(to, courseData, purchaseData) {
    const subject = `💰 Có học viên mới mua khóa học: ${courseData.name}`;

    const template = await this.loadTemplate("new-sale", {
      firstName: courseData.owner.firstName,
      courseName: courseData.name,
      coursePrice: courseData.priceEdu,
      buyerName:
        purchaseData.buyer.firstName + " " + purchaseData.buyer.lastName,
      buyerEmail: purchaseData.buyer.email,
      purchaseDate: new Date(purchaseData.createdAt).toLocaleDateString(
        "vi-VN"
      ),
      partnerDashboardUrl: `${process.env.FRONTEND_URL}/partner/sales`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo khi có assessment mới
  async sendNewAssessmentNotification(to, assessmentData, enrollmentData) {
    const subject = `📊 Bạn có điểm đánh giá mới: ${enrollmentData.itemName}`;

    const template = await this.loadTemplate("new-assessment", {
      firstName: enrollmentData.user.firstName,
      courseName: enrollmentData.itemName,
      assessmentType: assessmentData.type,
      score: assessmentData.score,
      maxScore: assessmentData.maxScore,
      feedback: assessmentData.feedback,
      assessmentDate: new Date(assessmentData.createdAt).toLocaleDateString(
        "vi-VN"
      ),
      enrollmentUrl: `${process.env.FRONTEND_URL}/enrollments/${enrollmentData._id}`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo khi có chứng chỉ được cấp
  async sendCertificateNotification(to, certificateData, enrollmentData) {
    const subject = `🏆 Chúc mừng! Bạn đã nhận được chứng chỉ: ${
      enrollmentData.courseTitle || enrollmentData.itemName || "Khóa học"
    }`;
    const template = await this.loadTemplate("certificate-issued", {
      firstName: enrollmentData.user?.firstName || "",
      courseName: enrollmentData.courseTitle || enrollmentData.itemName || "",
      grade: certificateData.grade || "",
      creditsEarned: certificateData.creditsEarned || "",
      certificateUrl:
        certificateData.certificateUrl || certificateData.certificateUrl,
      issuedDate: certificateData.issuedAt
        ? new Date(certificateData.issuedAt).toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN"),
      verificationUrl:
        certificateData.verificationUrl ||
        `${process.env.FRONTEND_URL}/verify-certificate/${
          certificateData.certificateId || ""
        }`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo khi mint NFT thành công
  async sendNFTMintNotification(to, nftData, userData) {
    const subject = `🎨 NFT đã được tạo thành công: ${nftData.name}`;

    const template = await this.loadTemplate("nft-mint", {
      firstName: userData.firstName,
      nftName: nftData.name,
      tokenId: nftData.tokenId,
      transactionHash: nftData.transactionHash,
      explorerUrl: `https://zeroscan.org/tx/${nftData.transactionHash}`,
      portfolioUrl: `${process.env.FRONTEND_URL}/portfolio`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Thông báo khi nhận EDU tokens
  async sendTokenRewardNotification(to, tokenData, userData) {
    const subject = `💰 Bạn đã nhận ${tokenData.amount} EDU Tokens!`;

    const template = await this.loadTemplate("token-reward", {
      firstName: userData.firstName,
      amount: tokenData.amount,
      reason: tokenData.reason || "Hoạt động trên nền tảng",
      transactionHash: tokenData.transactionHash,
      explorerUrl: `https://zeroscan.org/tx/${tokenData.transactionHash}`,
      walletUrl: `${process.env.FRONTEND_URL}/wallet`,
    });

    return this.sendEmail(to, subject, template);
  }

  // Load email template
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates/email",
        `${templateName}.html`
      );
      let template = await fs.readFile(templatePath, "utf8");

      // Replace template variables
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        template = template.replace(regex, data[key] || "");
      });

      return template;
    } catch (error) {
      console.error(`Failed to load email template ${templateName}:`, error);
      return this.getDefaultTemplate(templateName, data);
    }
  }

  // Default template fallback
  getDefaultTemplate(templateName, data) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>EduWallet Notification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 EduWallet</h1>
            <p>Nền tảng giáo dục blockchain</p>
          </div>
          <div class="content">
            {{content}}
          </div>
          <div class="footer">
            <p>© 2025 EduWallet. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let content = "";
    switch (templateName) {
      case "welcome":
        content = `
          <h2>Chào mừng ${data.firstName}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản EduWallet. Bạn có thể bắt đầu khám phá nền tảng ngay bây giờ.</p>
          <a href="${data.loginUrl}" class="btn">Đăng nhập ngay</a>
        `;
        break;
      case "course-purchase":
        content = `
          <h2>Xác nhận mua khóa học</h2>
          <p>Chào ${data.firstName},</p>
          <p>Bạn đã mua thành công khóa học <strong>${data.courseName}</strong> với giá ${data.coursePrice} EDU tokens.</p>
          <a href="${data.accessLink}" class="btn">Truy cập khóa học</a>
        `;
        break;
      default:
        content = `<h2>Thông báo từ EduWallet</h2><p>Bạn có thông báo mới.</p>`;
    }

    return baseTemplate.replace("{{content}}", content);
  }

  // Core email sending function
  async sendEmail(to, subject, html, attachments = []) {
    if (!this.isConfigured) {
      console.log("Email service not configured, skipping email send");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const mailOptions = {
        from: `"EduWallet" <${
          process.env.EMAIL_FROM || process.env.EMAIL_USER
        }>`,
        to,
        subject,
        html,
        attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        to,
        subject,
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        to,
        subject,
      };
    }
  }

  // Bulk email sending
  async sendBulkEmails(emails) {
    const results = [];

    for (const email of emails) {
      const result = await this.sendEmail(
        email.to,
        email.subject,
        email.html,
        email.attachments
      );
      results.push(result);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  // Test email configuration
  async testConfiguration() {
    if (!this.isConfigured) {
      return { success: false, error: "Email service not configured" };
    }

    try {
      const testEmail = process.env.EMAIL_USER;
      const result = await this.sendEmail(
        testEmail,
        "🧪 EduWallet Email Test",
        "<h2>Email service is working!</h2><p>This is a test email from EduWallet.</p>"
      );

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
