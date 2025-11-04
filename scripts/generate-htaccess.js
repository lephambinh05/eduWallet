const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ File .env không tồn tại tại: ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    line = line.trim();
    // Skip comments and empty lines
    if (!line || line.startsWith("#")) return;

    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  });

  return envVars;
}

// Generate .htaccess content from environment variables
function generateHtaccess(env) {
  // Extract CSP-related URLs
  const backendUrl =
    env.REACT_APP_BACKEND_URL || "https://api-eduwallet.mojistudio.vn";
  const frontendUrl =
    env.REACT_APP_FRONTEND_URL || "https://eduwallet.mojistudio.vn";

  // Parse backend URL to get protocol and host
  const backendUrlObj = new URL(backendUrl);
  const backendOrigin = backendUrlObj.origin;

  // Build CSP directives from env
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com",
  ];

  const fontSrc = [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
    "https://cdnjs.cloudflare.com",
  ];

  const connectSrc = ["'self'", backendOrigin];

  // Add localhost for development
  if (env.NODE_ENV === "development") {
    connectSrc.push("http://localhost:3001");
    connectSrc.push("http://localhost:5000");
    connectSrc.push("ws://localhost:3001");
    connectSrc.push("ws://localhost:5000");
  }

  // Add WebSocket support for production
  if (backendOrigin.startsWith("https://")) {
    connectSrc.push(backendOrigin.replace("https://", "wss://"));
  }

  const cspDirective =
    [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      `style-src ${styleSrc.join(" ")}`,
      `img-src 'self' data: https:`,
      `font-src ${fontSrc.join(" ")}`,
      `connect-src ${connectSrc.join(" ")}`,
    ].join("; ") + ";";

  return `<IfModule mod_rewrite.c>
  # Enable Rewrite Engine
  RewriteEngine On

  # Set base directory
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle React Router - Redirect all requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L,QSA]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  # Prevent clickjacking
  Header always set X-Frame-Options "SAMEORIGIN"

  # XSS Protection
  Header always set X-XSS-Protection "1; mode=block"

  # Prevent MIME sniffing
  Header always set X-Content-Type-Options "nosniff"

  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"

  # Content Security Policy
  # Generated from environment variables
  # Backend URL: ${backendUrl}
  # Frontend URL: ${frontendUrl}
  Header always set Content-Security-Policy "${cspDirective}"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On

  # HTML - 1 hour
  ExpiresByType text/html "access plus 1 hour"

  # CSS & JS - 1 year
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"

  # Images - 1 year
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"

  # Fonts - 1 year
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/font-woff "access plus 1 year"

  # Default - 1 month
  ExpiresDefault "access plus 1 month"
</IfModule>

# Prevent directory browsing
Options -Indexes

# Prevent access to hidden files
<FilesMatch "^\\.">
  Order allow,deny
  Deny from all
</FilesMatch>
`;
}

// Main function
function main() {
  const rootDir = path.join(__dirname, "..");
  const envPath = path.join(rootDir, ".env");
  const buildDir = path.join(rootDir, "build");
  const deploymentDir = path.join(rootDir, "deployment", "eduwallet-frontend");

  console.log("🚀 Generating .htaccess file from environment variables...");
  console.log(`📁 Root directory: ${rootDir}`);
  console.log(`📄 Loading .env from: ${envPath}`);

  // Load environment variables
  const env = loadEnvFile(envPath);
  console.log(`✅ Loaded ${Object.keys(env).length} environment variables`);
  console.log(`🌐 Backend URL: ${env.REACT_APP_BACKEND_URL}`);
  console.log(`🌐 Frontend URL: ${env.REACT_APP_FRONTEND_URL}`);
  console.log(`🔧 Environment: ${env.NODE_ENV || "production"}`);

  // Generate .htaccess content
  const htaccessContent = generateHtaccess(env);

  // Write to build directory (if exists)
  if (fs.existsSync(buildDir)) {
    const buildHtaccessPath = path.join(buildDir, ".htaccess");
    fs.writeFileSync(buildHtaccessPath, htaccessContent);
    console.log(`✅ Generated: ${buildHtaccessPath}`);
  } else {
    console.log(`⚠️  Build directory not found: ${buildDir}`);
  }

  // Write to deployment directory
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  const deploymentHtaccessPath = path.join(deploymentDir, ".htaccess");
  fs.writeFileSync(deploymentHtaccessPath, htaccessContent);
  console.log(`✅ Generated: ${deploymentHtaccessPath}`);

  console.log("\n✨ .htaccess generation completed successfully!");
}

// Run the script
try {
  main();
} catch (error) {
  console.error("❌ Error generating .htaccess:", error.message);
  process.exit(1);
}
