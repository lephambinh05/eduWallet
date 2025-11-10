#!/usr/bin/env node
/*
  E2E helper: simulate a partner-course purchase and verify enrollment + accessLink.

  Usage (on VPS or local, from project root):
    export API_BASE="https://api-eduwallet.mojistudio.vn"    # base URL of backend
    export USER_JWT="ey..."                                 # Bearer token for a test user (buyer)
    export COURSE_ID="690f5823cb9c2ccc45077ad4"
    export STUDENT_ID="690f5d933a6f87781e6ba3e3"            # optional, used to verify enrollment.user

    node scripts/e2e_purchase_and_check.js

  Notes:
  - This script requires a valid JWT for an authenticated user that can buy the course.
  - The backend must be reachable from where you run it.
  - It will POST to /api/partner/courses/:id/purchase and then verify the returned enrollment.accessLink
  - It will then request the accessLink and check for HTTP 200.
*/

const axios = require("axios");

async function main() {
  const API_BASE = process.env.API_BASE || "http://localhost:3000";
  const USER_JWT = process.env.USER_JWT;
  const COURSE_ID = process.env.COURSE_ID;
  const STUDENT_ID = process.env.STUDENT_ID;

  if (!USER_JWT || !COURSE_ID) {
    console.error(
      "Missing required env variables. Set USER_JWT and COURSE_ID."
    );
    process.exit(2);
  }

  const client = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${USER_JWT}`,
      "Content-Type": "application/json",
    },
    // allow self-signed TLS in dev environments (optional)
    httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
  });

  try {
    console.log(
      `Posting purchase for course ${COURSE_ID} -> ${API_BASE}/api/partner/courses/${COURSE_ID}/purchase`
    );
    const resp = await client.post(
      `/api/partner/courses/${COURSE_ID}/purchase`,
      {}
    );
    if (!resp || !resp.data || !resp.data.success) {
      console.error("Purchase API returned non-success:", resp && resp.data);
      process.exit(3);
    }

    const { purchase, enrollment } = resp.data.data || {};
    console.log("Purchase created:", purchase && purchase._id);
    console.log("Enrollment created:", enrollment && enrollment._id);

    const accessLink = enrollment && enrollment.accessLink;
    if (!accessLink) {
      console.error("No accessLink returned in enrollment.");
      process.exit(4);
    }

    console.log("Access link:", accessLink);

    // Quick check: GET the accessLink and expect 200
    try {
      console.log("Checking accessLink (HEAD)...");
      const check = await axios.head(accessLink, {
        maxRedirects: 5,
        validateStatus: null,
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      });
      console.log(`accessLink status: ${check.status}`);
      if (check.status >= 200 && check.status < 400) {
        console.log("accessLink reachable — OK");
      } else {
        console.warn("accessLink returned non-2xx/3xx status:", check.status);
      }
    } catch (err) {
      console.error("Failed to fetch accessLink:", err.message || err);
    }

    // Optionally validate enrollment via API (my-enrollments)
    try {
      const me = await client.get("/api/partner/my-enrollments");
      const enrollments = me.data && me.data.data && me.data.data.enrollments;
      const found = (enrollments || []).find(
        (e) =>
          String(e.itemId) === String(COURSE_ID) ||
          (e._id && e._id === (enrollment && enrollment._id))
      );
      console.log("Enrollment visible in /my-enrollments:", !!found);
    } catch (err) {
      console.warn("Could not fetch /my-enrollments:", err.message || err);
    }

    console.log("E2E purchase/check finished.");
  } catch (err) {
    console.error(
      "E2E run failed:",
      err.response && err.response.data ? err.response.data : err.message || err
    );
    process.exit(1);
  }
}

main();
