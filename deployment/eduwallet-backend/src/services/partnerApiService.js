const axios = require("axios");
const crypto = require("crypto");

class PartnerApiService {
  constructor() {
    this.httpClient = axios.create({
      timeout: parseInt(process.env.PARTNER_API_TIMEOUT, 10) || 30000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async createCourseAccess(partner, courseId, studentData) {
    const payload = {
      courseId,
      studentId: studentData.id,
      studentEmail: studentData.email,
      studentName: studentData.name,
      purchaseId: studentData.purchaseId,
      validUntil:
        studentData.validUntil ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };

    try {
      const response = await this.httpClient.post(
        partner.apiEndpoints.courseAccess,
        payload,
        {
          headers: {
            Authorization: `Bearer ${partner.apiKey}`,
            "X-EduWallet-Timestamp": Math.floor(Date.now() / 1000),
            "X-EduWallet-Signature": this.generateSignature(partner, payload),
          },
        }
      );
      return response.data;
    } catch (error) {
      // normalize error
      throw error;
    }
  }

  async getLearningProgress(partner, studentId, courseId) {
    try {
      const url = `${partner.apiEndpoints.learningProgress.replace(
        /\/$/,
        ""
      )}/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}`;
      const response = await this.httpClient.get(url, {
        headers: {
          Authorization: `Bearer ${partner.apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  generateSignature(partner, payload) {
    if (!partner || !partner.apiSecretKey) return "";
    return crypto
      .createHmac("sha256", partner.apiSecretKey)
      .update(JSON.stringify(payload))
      .digest("hex");
  }
}

module.exports = new PartnerApiService();
