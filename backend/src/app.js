const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const xss = require("xss-clean");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Import configurations
require("dotenv").config();
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// Initialize blockchain service (optional)
let blockchainService;
try {
  blockchainService = require("./services/blockchainService");
  logger.info("Blockchain service initialized");
} catch (error) {
  logger.warn("Blockchain service initialization failed:", error.message);
}

// Optionally start background reconciler for pending transactions
if (process.env.RECONCILE_PENDING_TX === "true") {
  try {
    const { reconcilePending } = require("./services/txReconciler");
    const interval = parseInt(process.env.RECONCILE_INTERVAL_MS, 10) || 30000;
    logger.info(`Starting background tx reconciler every ${interval}ms`);
    setInterval(async () => {
      try {
        await reconcilePending({
          limit: parseInt(process.env.RECONCILE_BATCH_SIZE, 10) || 50,
        });
      } catch (e) {
        logger.error("Background reconciler error", { error: e.message });
      }
    }, interval);
  } catch (e) {
    logger.error("Failed to start background reconciler", { error: e.message });
  }
}

// Import models (must be loaded before routes that use them)
require("./models/Institution");
require("./models/Certificate");
require("./models/LearnPass");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const institutionRoutes = require("./routes/institutions");
const learnPassRoutes = require("./routes/learnPass");
const certificateRoutes = require("./routes/certificates");
const marketplaceRoutes = require("./routes/marketplace");
const blockchainRoutes = require("./routes/blockchain");
const eduWalletDataStoreRoutes = require("./routes/eduWalletDataStore");
const pointRoutes = require("./routes/point");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

// Import middleware

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EduWallet API",
      version: "1.0.0",
      description:
        "API documentation for EduWallet - NFT Learning Passport Platform",
      contact: {
        name: "EduWallet Team",
        email: "support@eduwallet.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.eduwallet.com"
            : `http://localhost:${process.env.PORT}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/learnpass", learnPassRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/eduwallet", eduWalletDataStoreRoutes);
app.use("/api/point", pointRoutes);
app.use("/api/admin", adminRoutes);
// Public endpoints (no auth)
app.use("/api/public", publicRoutes);

// Debug: list mounted routes (helpful for diagnosing 404s during development)
try {
  const list = [];
  if (app && app._router && app._router.stack) {
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        const methods = Object.keys(middleware.route.methods)
          .join(",")
          .toUpperCase();
        list.push(`${methods} ${middleware.route.path}`);
      } else if (
        middleware.name === "router" &&
        middleware.handle &&
        middleware.handle.stack
      ) {
        // router middleware
        middleware.handle.stack.forEach(function (r) {
          if (r.route && r.route.path) {
            const methods = Object.keys(r.route.methods)
              .join(",")
              .toUpperCase();
            // Try to reconstruct full path by inspecting parent regexp if possible
            list.push(`${methods} ${r.route.path}`);
          }
        });
      }
    });
    console.log("🗂️ Registered routes:");
    list.slice(0, 200).forEach((l) => console.log("  " + l));
  }
} catch (e) {
  console.warn("Could not list routes:", e.message);
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Handle LearnPass updates
  socket.on("learnpass-update", (data) => {
    socket.to(`user-${data.userId}`).emit("learnpass-updated", data);
  });

  // Handle certificate issuance
  socket.on("certificate-issued", (data) => {
    socket.to(`user-${data.userId}`).emit("certificate-received", data);
  });

  // Handle marketplace notifications
  socket.on("marketplace-purchase", (data) => {
    socket.to(`user-${data.userId}`).emit("purchase-notification", data);
  });

  // Handle reward distribution
  socket.on("reward-distributed", (data) => {
    socket.to(`user-${data.userId}`).emit("reward-received", data);
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT;
const HOST = process.env.HOST;

server.listen(PORT, HOST, () => {
  logger.info(`🚀 EduWallet Backend Server running on http://${HOST}:${PORT}`);
  logger.info(
    `📚 API Documentation available at http://${HOST}:${PORT}/api-docs`
  );
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS Origin: ${process.env.CORS_ORIGIN}`);
});

module.exports = app;
