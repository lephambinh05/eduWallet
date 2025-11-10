const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Enrollment = require("../src/models/Enrollment");
const User = require("../src/models/User");
const PartnerSource = require("../src/models/PartnerSource");

async function syncPartnerEnrollments() {
  try {
    console.log("[SYNC] Starting partner enrollment sync...");

    // Connect to MongoDB
    console.log("[SYNC] Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/eduwallet"
    );
    console.log("[SYNC] MongoDB connected successfully");

    // Test connection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "[SYNC] Available collections:",
      collections.map((c) => c.name)
    );

    // Get all partners (users with partner role or all users for now)
    console.log("[SYNC] Querying all users...");
    const allUsers = await User.find({})
      .select("username role email")
      .limit(10);
    console.log(`[SYNC] Total users in DB: ${allUsers.length}`);
    console.log(`[SYNC] Sample users:`, allUsers);

    const partners = await User.find({ role: "partner" });
    console.log(`[SYNC] Found ${partners.length} partners with role 'partner'`);
    if (partners.length === 0) {
      console.log("[SYNC] No partners found, checking all users...");
      const allUsers = await User.find({})
        .select("username role email")
        .limit(10);
      console.log(`[SYNC] Total users in DB: ${allUsers.length}`);
      console.log(`[SYNC] Sample users:`, allUsers);
      return; // Exit if no partners
    }

    for (const partner of partners) {
      try {
        console.log(`[SYNC] Processing partner: ${partner.username}`);

        // Get partner sources for this partner
        const partnerSources = await PartnerSource.find({
          partner: partner._id,
        });
        console.log(
          `[SYNC] Found ${partnerSources.length} sources for ${partner.username}`
        );

        for (const source of partnerSources) {
          // Get all enrollments and filter by accessLink containing courseId
          const allEnrollments = await Enrollment.find({})
            .populate("user", "username")
            .limit(100);
          const enrollments = allEnrollments.filter(
            (e) => e.accessLink && e.accessLink.includes(source.courses[0])
          );

          console.log(
            `[SYNC] Found ${enrollments.length} active enrollments for source ${source.name}`
          );

          for (const enrollment of enrollments) {
            try {
              await syncSingleEnrollment(enrollment, partner, source);
            } catch (error) {
              console.error(
                `[SYNC] Error syncing enrollment ${enrollment._id}:`,
                error.message
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `[SYNC] Error processing partner ${partner.name}:`,
          error.message
        );
      }
    }

    console.log("[SYNC] Partner enrollment sync completed");
  } catch (error) {
    console.error("[SYNC] Fatal error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

async function syncSingleEnrollment(enrollment, partner, source) {
  try {
    console.log(
      `[SYNC] Checking enrollment ${enrollment._id} for user ${
        enrollment.user?.username || "unknown"
      }`
    );

    // Call partner API to get enrollment status
    const partnerApiUrl = `${source.domain}/api/enrollment/${enrollment._id}`;

    const response = await axios.get(partnerApiUrl, {
      timeout: 5000, // 5 second timeout
    });

    const partnerData = response.data;

    if (!partnerData.success || !partnerData.data) {
      console.log(
        `[SYNC] No data returned from partner for enrollment ${enrollment._id}`
      );
      return;
    }

    const partnerEnrollment = partnerData.data.enrollment || partnerData.data;

    // Only update if partner status is completed and EduWallet is not completed
    if (
      partnerEnrollment.status === "completed" &&
      enrollment.status !== "completed"
    ) {
      console.log(`[SYNC] Updating enrollment ${enrollment._id} to completed`);

      // Update enrollment with partner data
      const updateData = {
        status: "completed",
        completedAt: partnerEnrollment.completedAt || new Date(),
        progressPercent: partnerEnrollment.progressPercent || 100,
        totalPoints: partnerEnrollment.totalPoints || 0,
        timeSpentSeconds: partnerEnrollment.timeSpentSeconds || 0,
        lastAccessed: partnerEnrollment.lastAccessed || new Date(),
      };

      // Add any additional metadata from partner
      if (partnerEnrollment.metadata) {
        updateData.metadata = {
          ...enrollment.metadata,
          ...partnerEnrollment.metadata,
          syncedFromPartner: true,
          syncedAt: new Date(),
        };
      }

      await Enrollment.findByIdAndUpdate(enrollment._id, updateData);

      console.log(
        `[SYNC] Successfully updated enrollment ${enrollment._id} with status: completed`
      );

      // TODO: Could also create CompletedCourse record if needed
      // await createCompletedCourseRecord(enrollment, partnerEnrollment);
    } else if (
      partnerEnrollment.status === "completed" &&
      enrollment.status === "completed"
    ) {
      console.log(
        `[SYNC] Enrollment ${enrollment._id} already completed, skipping`
      );
    } else {
      console.log(
        `[SYNC] Enrollment ${enrollment._id} partner status: ${partnerEnrollment.status}, EduWallet status: ${enrollment.status}, no update needed`
      );
    }
  } catch (error) {
    console.error(
      `[SYNC] Error syncing enrollment ${enrollment._id}:`,
      error.message
    );
    // Don't throw error, continue with other enrollments
  }
}

// Run the sync
if (require.main === module) {
  syncPartnerEnrollments()
    .then(() => {
      console.log("[SYNC] Sync completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[SYNC] Sync failed:", error);
      process.exit(1);
    });
}

module.exports = { syncPartnerEnrollments, syncSingleEnrollment };
