// cSpell:words ipfs IPFS Ipfs learnpass learnpasses
const express = require("express");
const router = express.Router();
const {
  validate,
  validateQuery,
  validateParams,
  schemas,
} = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateToken, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// (admin wallet endpoints defined further below - protected)

// ==================== Dashboard ====================
router.get(
  "/dashboard",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(adminController.getDashboardStats)
);

// ==================== User Management ====================

// Get all users with filters
// Get configured admin wallet (protected - admin only)
router.get(
  "/wallet",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const AdminWallet = require("../models/AdminWallet");
    const wallet = await AdminWallet.findOne().sort({ createdAt: -1 });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Admin wallet not configured",
      });
    }

    // Return wallet and conversion settings (if present)
    res.json({
      success: true,
      data: {
        address: wallet.address,
        chainId: wallet.chainId,
        networkName: wallet.networkName,
        eduPrice: wallet.eduPrice || null,
        minConvertPZO: wallet.minConvertPZO || null,
        maxConvertPZO: wallet.maxConvertPZO || null,
      },
    });
  })
);

// Admin: preview IPFS metadata for a given blockchain transaction (mint)
router.get(
  "/nft-portfolio/:id/preview",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const BlockchainTransaction = require("../models/BlockchainTransaction");
    const axios = require("axios");

    const tx = await BlockchainTransaction.findById(req.params.id).lean();
    if (!tx)
      return res.status(404).json({ success: false, message: "Not found" });

    // Use only Pinata gateway for IPFS fetches
    const gateways = [
      process.env.IPFS_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/",
    ];

    // determine ipfs path or direct URL
    let ipfsPath = null;
    let directUrl = null;
    if (tx.ipfsHash) {
      ipfsPath = String(tx.ipfsHash).replace(/^\/+/, "");
    } else if (tx.metadataURI) {
      const uri = String(tx.metadataURI);
      if (uri.startsWith("ipfs://")) {
        ipfsPath = uri.replace(/^ipfs:\/\//, "");
      } else if (/^https?:\/\//i.test(uri)) {
        directUrl = uri;
      } else if (uri.includes("/ipfs/")) {
        // extract path after /ipfs/
        const m = uri.match(/\/ipfs\/(.+)$/);
        if (m) ipfsPath = m[1];
      }
    }

    if (!ipfsPath && !directUrl)
      return res
        .status(400)
        .json({ success: false, message: "No IPFS metadata available" });

    // try direct URL first (if present), then try Pinata gateway only for ipfs paths
    const tryUrls = [];
    if (directUrl) tryUrls.push({ url: directUrl, gatewayUsed: null });
    if (ipfsPath) {
      for (const g of gateways)
        tryUrls.push({ url: g + ipfsPath, gatewayUsed: g });
    }

    let lastError = null;
    for (const attempt of tryUrls) {
      try {
        // try to fetch as JSON first
        const resp = await axios.get(attempt.url, {
          timeout: 10000,
          responseType: "json",
          validateStatus: null,
        });
        if (resp.status === 200 && resp.data) {
          const data = resp.data;

          const fixIpfs = (u) => {
            if (!u) return null;
            if (String(u).startsWith("ipfs://"))
              return (
                (attempt.gatewayUsed || gateways[0]) +
                String(u).replace(/^ipfs:\/\//, "")
              );
            return u;
          };

          // normalize ipfs links inside metadata but do NOT return previewImage
          if (typeof data === "object" && data.image) {
            data.image = fixIpfs(data.image);
          }

          return res.json({
            success: true,
            data: {
              metadata: data,
              sourceUrl: attempt.url,
              gateway: attempt.gatewayUsed,
            },
          });
        }

        // If response is HTML or image or text, handle accordingly
        if (
          resp.status === 200 &&
          resp.headers &&
          resp.headers["content-type"]
        ) {
          const ct = resp.headers["content-type"];
          if (ct.includes("application/json") || ct.includes("text/plain")) {
            // try to parse as text then JSON
            const textResp = await axios.get(attempt.url, {
              timeout: 10000,
              responseType: "text",
              validateStatus: null,
            });
            try {
              const parsed = JSON.parse(textResp.data);
              const fixIpfs = (u) =>
                u && String(u).startsWith("ipfs://")
                  ? (attempt.gatewayUsed || gateways[0]) +
                    String(u).replace(/^ipfs:\/\//, "")
                  : u;
              if (parsed && parsed.image) parsed.image = fixIpfs(parsed.image);
              return res.json({
                success: true,
                data: {
                  metadata: parsed,
                  sourceUrl: attempt.url,
                  gateway: attempt.gatewayUsed,
                },
              });
            } catch (e) {
              // not JSON
              return res.json({
                success: true,
                data: {
                  metadata: null,
                  sourceUrl: attempt.url,
                  gateway: attempt.gatewayUsed,
                },
              });
            }
          }

          if (ct.startsWith("image/")) {
            // the URL itself is an image; return success but no previewImage
            return res.json({
              success: true,
              data: {
                metadata: null,
                sourceUrl: attempt.url,
                gateway: attempt.gatewayUsed,
              },
            });
          }
        }

        // non-200 or not useful content-type -> treat as failure and try next
        lastError = new Error(
          `Unexpected status ${resp.status} from ${attempt.url}`
        );
        // continue to next gateway
      } catch (err) {
        lastError = err;
        // If gateway returned 502 Bad Gateway, try next gateway
        if (err.response && err.response.status === 502) {
          continue;
        }
        // For other errors, also continue to try next
        continue;
      }
    }

    console.error(
      "Failed to fetch IPFS metadata (all gateways tried):",
      lastError && (lastError.message || lastError)
    );
    return res.status(502).json({
      success: false,
      message: "Failed to fetch metadata from IPFS gateways",
      error: lastError && (lastError.message || String(lastError)),
    });
  })
);

// Public read-only endpoint for admin wallet and conversion settings
// This allows client apps (non-admin users) to read the current price/min/max
// without needing an admin token. It intentionally returns only public fields.
router.get(
  "/public/admin-wallet",
  asyncHandler(async (req, res) => {
    const AdminWallet = require("../models/AdminWallet");
    const wallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    if (!wallet) {
      return res.json({ success: true, data: { wallet: null } });
    }

    res.json({
      success: true,
      data: {
        address: wallet.address,
        // only expose public conversion settings
        eduPrice: wallet.eduPrice || null,
        minConvertPZO: wallet.minConvertPZO || null,
        maxConvertPZO: wallet.maxConvertPZO || null,
      },
    });
  })
);

// Create or update admin wallet (upsert) - admin only
router.post(
  "/wallet",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const {
      address,
      chainId,
      networkName,
      eduPrice,
      minConvertPZO,
      maxConvertPZO,
    } = req.body;
    const { AppError } = require("../middleware/errorHandler");

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new AppError("Invalid wallet address", 400);
    }

    const AdminWallet = require("../models/AdminWallet");

    const updateFields = {
      address: address.toLowerCase(),
      chainId: chainId || null,
      networkName: networkName || null,
      createdAt: new Date(),
    };

    // Only set conversion fields when provided in the request body
    if (typeof eduPrice !== "undefined")
      updateFields.eduPrice = eduPrice ? String(eduPrice) : null;
    if (typeof minConvertPZO !== "undefined")
      updateFields.minConvertPZO = minConvertPZO ? String(minConvertPZO) : null;
    if (typeof maxConvertPZO !== "undefined")
      updateFields.maxConvertPZO = maxConvertPZO ? String(maxConvertPZO) : null;

    const updated = await AdminWallet.findOneAndUpdate({}, updateFields, {
      upsert: true,
      new: true,
    });

    const loggerUtil = require("../utils/logger");
    if (req.user && req.user._id) {
      await loggerUtil.logUserAction(req.user._id, "admin_wallet_updated", {
        address: updated.address,
      });
    }

    res.status(201).json({ success: true, data: { wallet: updated } });
  })
);

// Admin endpoint to trigger reconciliation of pending blockchain transactions
router.post(
  "/reconcile-transactions",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const { reconcilePending } = require("../services/txReconciler");
    const limit = parseInt(req.body.limit, 10) || 100;
    const result = await reconcilePending({ limit });
    res.json({ success: true, data: result });
  })
);

// Create new user (admin)
router.post(
  "/users",
  authenticateToken,
  authorize("admin", "super_admin"),
  validate(schemas.adminCreateUser),
  asyncHandler(adminController.createUser)
);

// Get all users with filters (admin)
router.get(
  "/users",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateQuery(schemas.adminUsersQuery),
  asyncHandler(adminController.getAllUsers)
);

// Bulk operations
router.post(
  "/users/bulk-delete",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(adminController.bulkDeleteUsers)
);

router.post(
  "/users/bulk-update-role",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(adminController.bulkUpdateRole)
);

// Get single user
router.get(
  "/users/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(adminController.getUserById)
);

// Update user
router.put(
  "/users/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUser),
  asyncHandler(adminController.updateUser)
);

// Delete user
router.delete(
  "/users/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(adminController.deleteUser)
);

// Update user role
router.patch(
  "/users/:id/role",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUserRole),
  asyncHandler(adminController.updateUserRole)
);

// Update user status
router.patch(
  "/users/:id/status",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUserStatus),
  asyncHandler(adminController.updateUserStatus)
);

// Block user
router.post(
  "/users/:id/block",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  validate(schemas.adminBlockUser),
  asyncHandler(adminController.blockUser)
);

// Unblock user
router.post(
  "/users/:id/unblock",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(adminController.unblockUser)
);

// Get user activities
router.get(
  "/users/:id/activities",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(adminController.getUserActivities)
);

// Update user EDU tokens
router.patch(
  "/users/:id/edu-tokens",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(adminController.updateUserEduTokens)
);

// ==================== Activity Logs ====================
router.get(
  "/activities",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(adminController.getSystemActivities)
);

// ==================== Institutions Management ====================
router.get(
  "/institutions",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const Institution = require("../models/Institution");
    const institutions = await Institution.find().sort({ createdAt: -1 });

    res.json({ success: true, data: { institutions } });
  })
);

router.post(
  "/institutions/:id/approve",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const Institution = require("../models/Institution");
    const { AppError } = require("../middleware/errorHandler");
    const logger = require("../utils/logger");

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError("Institution not found", 404);
    }

    await logger.logUserAction(req.user._id, "institution_approved", {
      institutionId: req.params.id,
    });

    res.json({ success: true, data: { institution } });
  })
);

router.post(
  "/institutions/:id/reject",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const Institution = require("../models/Institution");
    const { AppError } = require("../middleware/errorHandler");
    const logger = require("../utils/logger");

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, rejectedAt: new Date(), rejectedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError("Institution not found", 404);
    }

    await logger.logUserAction(req.user._id, "institution_rejected", {
      institutionId: req.params.id,
    });

    res.json({ success: true, data: { institution } });
  })
);

// ==================== Certificate Management ====================

// Get all certificates with filters
router.get(
  "/certificates",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const Certificate = require("../models/Certificate");
    const {
      page = 1,
      limit = 12,
      search,
      status,
      institution,
      fromDate,
      toDate,
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: "i" } },
        { certificateId: { $regex: search, $options: "i" } },
        { issuerName: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Institution filter
    if (institution) {
      query.issuer = institution;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.issueDate = {};
      if (fromDate) query.issueDate.$gte = new Date(fromDate);
      if (toDate) query.issueDate.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [certificates, total] = await Promise.all([
      Certificate.find(query)
        .populate("student", "firstName lastName email walletAddress studentId")
        .populate("issuer", "name logo institutionId")
        .sort({ issueDate: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Certificate.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  })
);

// Get certificate by ID
router.get(
  "/certificates/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require("../models/Certificate");
    const { AppError } = require("../middleware/errorHandler");

    const certificate = await Certificate.findById(req.params.id)
      .populate("student", "firstName lastName email walletAddress studentId")
      .populate("issuer", "name logo website institutionId");

    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }

    res.json({ success: true, data: { certificate } });
  })
);

// Verify certificate
router.post(
  "/certificates/:id/verify",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require("../models/Certificate");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }

    if (certificate.status === "verified") {
      throw new AppError("Certificate is already verified", 400);
    }

    certificate.status = "verified";
    certificate.verifiedAt = new Date();
    certificate.verifiedBy = req.user._id;
    await certificate.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "certificate_verified",
      description: `Certificate ${certificate.certificateId} verified for student ${certificate.student}`,
      targetResource: {
        resourceType: "Certificate",
        resourceId: certificate._id,
      },
      metadata: {
        certificateId: certificate.certificateId,
        studentId: certificate.student,
      },
    });

    res.json({
      success: true,
      message: "Certificate verified successfully",
      data: { certificate },
    });
  })
);

// Revoke certificate
router.post(
  "/certificates/:id/revoke",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require("../models/Certificate");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");
    const { reason } = req.body;

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }

    if (certificate.status === "revoked") {
      throw new AppError("Certificate is already revoked", 400);
    }

    certificate.status = "revoked";
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user._id;
    certificate.revocationReason = reason;
    await certificate.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "certificate_revoked",
      description: `Certificate ${certificate.certificateId} revoked. Reason: ${reason}`,
      targetResource: {
        resourceType: "Certificate",
        resourceId: certificate._id,
      },
      metadata: {
        certificateId: certificate.certificateId,
        studentId: certificate.student,
        reason,
      },
    });

    res.json({
      success: true,
      message: "Certificate revoked successfully",
      data: { certificate },
    });
  })
);

// Get certificate activities
router.get(
  "/certificates/:id/activities",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const ActivityLog = require("../models/ActivityLog");
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find({
        targetType: "Certificate",
        targetId: req.params.id,
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments({
        targetType: "Certificate",
        targetId: req.params.id,
      }),
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
        },
      },
    });
  })
);

// ==================== LearnPass Management ====================

// Get all LearnPasses with filters
router.get(
  "/learnpasses",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const {
      page = 1,
      limit = 12,
      search,
      status,
      verificationStatus,
      institution,
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Verification status filter
    if (verificationStatus === "verified") {
      query.isVerified = true;
    } else if (verificationStatus === "unverified") {
      query.isVerified = false;
    }

    // Institution filter
    if (institution) {
      query.institutionId = institution;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [learnPasses, total] = await Promise.all([
      LearnPass.find(query)
        .populate("owner", "firstName lastName email walletAddress studentId")
        .populate("institutionId", "name logo institutionId")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      LearnPass.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        learnPasses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  })
);

// ==================== NFT Portfolio ====================
// Admin: list minted NFT transactions (paginated)
router.get(
  "/nft-portfolio",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const BlockchainTransaction = require("../models/BlockchainTransaction");
    const { page = 1, limit = 20, search } = req.query;

    const { collection } = req.query;

    // By default show all mint-like transactions (includes "mint", "portfolio_mint", etc.)
    const query = { type: { $regex: "mint", $options: "i" } };

    // allow explicit type override via query param
    if (req.query.type) {
      query.type = req.query.type;
    }

    // search across common fields
    if (search) {
      query.$or = [
        { tokenId: { $regex: search, $options: "i" } },
        { txHash: { $regex: search, $options: "i" } },
        { ipfsHash: { $regex: search, $options: "i" } },
        { metadataURI: { $regex: search, $options: "i" } },
        { "metadata.name": { $regex: search, $options: "i" } },
      ];
    }

    // allow filtering by collection or contract address
    if (collection) {
      // match explicit contractAddress field, or metadata.collection / metadata.contract
      query.$or = query.$or || [];
      query.$or.push({ contractAddress: collection });
      query.$or.push({ "metadata.collection": collection });
      query.$or.push({ "metadata.contract": collection });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      BlockchainTransaction.find(query)
        .populate("userId", "firstName lastName email walletAddress")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      BlockchainTransaction.countDocuments(query),
    ]);

    // shape response: ensure key fields present and surface metadata.collection/contract
    const shaped = items.map((it) => ({
      _id: it._id,
      userId: it.userId || null, // Keep as userId for frontend compatibility
      txHash: it.txHash,
      tokenId: it.tokenId,
      ipfsHash: it.ipfsHash,
      metadataURI: it.metadataURI,
      to: it.to || null,
      contractAddress: it.contractAddress || it.metadata?.contract || null,
      collection: it.metadata?.collection || null,
      // quick preview endpoint (admin-only) to fetch IPFS metadata
      previewUrl: `/api/admin/nft-portfolio/${it._id}/preview`,
      metadata: it.metadata || {},
      status: it.status,
      createdAt: it.createdAt,
    }));

    res.json({
      success: true,
      data: {
        items: shaped,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  })
);

// ==================== Portfolio Change Logs (Admin) ====================
router.get(
  "/portfolio-changes",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const PortfolioChange = require("../models/PortfolioChange");

    const {
      page = 1,
      limit = 50,
      userId,
      tokenId,
      changeType,
      from,
      to,
    } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (tokenId) query.tokenId = tokenId;
    if (changeType) query.changeType = changeType;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const docs = await PortfolioChange.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate("userId", "firstName lastName email")
      .lean();

    const total = await PortfolioChange.countDocuments(query);

    res.json({
      success: true,
      data: {
        changes: docs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
      },
    });
  })
);

// Get LearnPass by ID
router.get(
  "/learnpasses/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const { AppError } = require("../middleware/errorHandler");

    const learnPass = await LearnPass.findById(req.params.id)
      .populate("owner", "firstName lastName email walletAddress studentId")
      .populate("institutionId", "name logo website institutionId");

    if (!learnPass) {
      throw new AppError("LearnPass not found", 404);
    }

    res.json({ success: true, data: { learnPass } });
  })
);

// Verify LearnPass
router.post(
  "/learnpasses/:id/verify",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");

    const learnPass = await LearnPass.findById(req.params.id);

    if (!learnPass) {
      throw new AppError("LearnPass not found", 404);
    }

    if (learnPass.isVerified) {
      throw new AppError("LearnPass is already verified", 400);
    }

    learnPass.isVerified = true;
    learnPass.verifiedAt = new Date();
    learnPass.verifiedBy = req.user._id;
    await learnPass.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "learnpass_verified",
      description: `LearnPass ${learnPass.tokenId} verified for student ${learnPass.studentId}`,
      targetResource: {
        resourceType: "LearnPass",
        resourceId: learnPass._id,
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        ownerId: learnPass.owner,
      },
    });

    res.json({
      success: true,
      message: "LearnPass verified successfully",
      data: { learnPass },
    });
  })
);

// Suspend LearnPass
router.post(
  "/learnpasses/:id/suspend",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");
    const { reason } = req.body;

    const learnPass = await LearnPass.findById(req.params.id);

    if (!learnPass) {
      throw new AppError("LearnPass not found", 404);
    }

    if (learnPass.status === "suspended") {
      throw new AppError("LearnPass is already suspended", 400);
    }

    learnPass.status = "suspended";
    learnPass.suspendedAt = new Date();
    learnPass.suspendedBy = req.user._id;
    learnPass.suspensionReason = reason;
    await learnPass.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "learnpass_suspended",
      description: `LearnPass ${learnPass.tokenId} suspended. Reason: ${reason}`,
      targetResource: {
        resourceType: "LearnPass",
        resourceId: learnPass._id,
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        reason,
      },
    });

    res.json({
      success: true,
      message: "LearnPass suspended successfully",
      data: { learnPass },
    });
  })
);

// Reactivate LearnPass
router.post(
  "/learnpasses/:id/reactivate",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");

    const learnPass = await LearnPass.findById(req.params.id);

    if (!learnPass) {
      throw new AppError("LearnPass not found", 404);
    }

    if (learnPass.status !== "suspended") {
      throw new AppError("LearnPass is not suspended", 400);
    }

    learnPass.status = "active";
    learnPass.reactivatedAt = new Date();
    learnPass.reactivatedBy = req.user._id;
    await learnPass.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "learnpass_reactivated",
      description: `LearnPass ${learnPass.tokenId} reactivated for student ${learnPass.studentId}`,
      targetResource: {
        resourceType: "LearnPass",
        resourceId: learnPass._id,
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
      },
    });

    res.json({
      success: true,
      message: "LearnPass reactivated successfully",
      data: { learnPass },
    });
  })
);

// Revoke LearnPass
router.post(
  "/learnpasses/:id/revoke",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require("../models/LearnPass");
    const ActivityLog = require("../models/ActivityLog");
    const { AppError } = require("../middleware/errorHandler");
    const { reason } = req.body;

    const learnPass = await LearnPass.findById(req.params.id);

    if (!learnPass) {
      throw new AppError("LearnPass not found", 404);
    }

    if (learnPass.status === "revoked") {
      throw new AppError("LearnPass is already revoked", 400);
    }

    learnPass.status = "revoked";
    learnPass.revokedAt = new Date();
    learnPass.revokedBy = req.user._id;
    learnPass.revocationReason = reason;
    await learnPass.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: "learnpass_revoked",
      description: `LearnPass ${learnPass.tokenId} revoked. Reason: ${reason}`,
      targetResource: {
        resourceType: "LearnPass",
        resourceId: learnPass._id,
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        reason,
      },
    });

    res.json({
      success: true,
      message: "LearnPass revoked successfully",
      data: { learnPass },
    });
  })
);

// Get LearnPass activities
router.get(
  "/learnpasses/:id/activities",
  authenticateToken,
  authorize("admin", "super_admin"),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const ActivityLog = require("../models/ActivityLog");
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find({
        targetType: "LearnPass",
        targetId: req.params.id,
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments({
        targetType: "LearnPass",
        targetId: req.params.id,
      }),
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
        },
      },
    });
  })
);

// ==================== System Management ====================
router.get(
  "/health",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };

    res.json({ success: true, data: { health } });
  })
);

module.exports = router;
