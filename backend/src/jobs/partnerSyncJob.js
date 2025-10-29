const cron = require("node-cron");
const Partner = require("../models/Partner");
const Enrollment = require("../models/Enrollment");
const partnerApiService = require("../services/partnerApiService");

class PartnerSyncJob {
  constructor() {}

  start() {
    // Sync every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("🔄 Starting partner progress sync...");
      await this.syncAllActiveEnrollments();
    });

    // Daily partner course catalog sync at 02:00
    cron.schedule("0 2 * * *", async () => {
      console.log("📚 Starting partner course catalog sync...");
      await this.syncPartnerCourses();
    });
  }

  async syncAllActiveEnrollments() {
    try {
      const activeEnrollments = await Enrollment.find({
        status: "in_progress",
        seller: { $exists: true },
      }).populate("seller user itemId");
      for (const enrollment of activeEnrollments) {
        try {
          const partner = await Partner.findById(enrollment.seller);
          if (
            !partner ||
            !partner.apiEndpoints ||
            !partner.apiEndpoints.learningProgress
          )
            continue;
          const progressData = await partnerApiService.getLearningProgress(
            partner,
            String(enrollment.user._id),
            String(enrollment.itemId._id)
          );
          if (progressData && progressData.success) {
            // very small in-line update to reflect progress
            enrollment.progressPercent =
              progressData.data.progress?.completionPercentage ||
              enrollment.progressPercent;
            enrollment.timeSpentSeconds =
              progressData.data.progress?.totalTimeSpent ||
              enrollment.timeSpentSeconds;
            enrollment.lastAccessed = progressData.data.progress?.lastAccessed
              ? new Date(progressData.data.progress.lastAccessed)
              : enrollment.lastAccessed;
            enrollment.markModified("metadata");
            await enrollment.save();
          }
        } catch (err) {
          console.error(
            `Failed to sync enrollment ${enrollment._id}:`,
            err.message || err
          );
        }
      }
    } catch (error) {
      console.error("Partner sync job failed:", error.message || error);
    }
  }

  async syncPartnerCourses() {
    try {
      const partners = await Partner.find({
        status: "active",
        "apiEndpoints.courseCatalog": { $exists: true },
      });
      for (const partner of partners) {
        try {
          // placeholder: call partner course catalog endpoint and upsert courses
          // const res = await partnerApiService.getCourseCatalog(partner);
        } catch (err) {
          console.error(
            `Failed to sync courses for partner ${partner._id}:`,
            err.message || err
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to load partners for course sync",
        err.message || err
      );
    }
  }
}

module.exports = PartnerSyncJob;
