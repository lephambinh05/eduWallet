# 🔐 SECURITY POLICY - EDUWALLET

## 📋 **MỤC LỤC**
- [Chính sách quản lý khóa](#chính-sách-quản-lý-khóa)
- [Thiết lập môi trường](#thiết-lập-môi-trường)
- [Multi-Signature Wallets](#multi-signature-wallets)
- [Vault & HSM Integration](#vault--hsm-integration)
- [Quy trình triển khai](#quy-trình-triển-khai)
- [Báo cáo lỗ hổng](#báo-cáo-lỗ-hổng)

---

## 🔑 **CHÍNH SÁCH QUẢN LÝ KHÓA**

### **QUY TẮC VÀNG**

❌ **TUYỆT ĐỐI KHÔNG:**
- ❌ Commit private keys vào git
- ❌ Lưu private keys trong file .env của production
- ❌ Share private keys qua Slack, Discord, Email
- ❌ Sử dụng cùng một wallet cho dev/staging/production
- ❌ Hardcode secrets trong source code
- ❌ Log/print ra private keys
- ❌ Screenshot chứa private keys
- ❌ Sử dụng weak/predictable secrets

✅ **BẮT BUỘC PHẢI:**
- ✅ Sử dụng `.gitignore` để exclude `.env` files
- ✅ Sử dụng separate wallets cho mỗi environment
- ✅ Rotate secrets mỗi 90 ngày
- ✅ Sử dụng strong random secrets (min 32 chars)
- ✅ Enable audit logging
- ✅ Backup keys securely (offline, encrypted)
- ✅ Document key rotation procedures
- ✅ Use multi-signature for production

---

## 🛠️ **THIẾT LẬP MÔI TRƯỜNG**

### **1. Development Environment**

```bash
# Clone repo
git clone <repo-url>
cd eduWallet

# Copy environment templates
cp env.example .env
cp backend/env.example backend/.env
cp contract-project/env.example contract-project/.env

# Verify .env is in .gitignore
git check-ignore .env
# Should output: .env

# Generate strong JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Create TEST wallet (DO NOT use real funds!)
# Use MetaMask or similar wallet
# Save mnemonic phrase OFFLINE (encrypted)
```

### **2. Production Environment**

```bash
# DO NOT use .env files in production!
# Use environment variables from secure vault

# Option 1: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id eduwallet/prod/jwt-secret

# Option 2: Azure Key Vault
az keyvault secret show --vault-name eduwallet-vault --name jwt-secret

# Option 3: HashiCorp Vault
vault kv get secret/eduwallet/prod/jwt-secret

# Option 4: Kubernetes Secrets
kubectl create secret generic eduwallet-secrets \
  --from-literal=jwt-secret=$(cat secret.txt) \
  --namespace=production
```

---

## 🔐 **MULTI-SIGNATURE WALLETS**

### **Tại sao cần Multi-Sig?**

Single private key = Single point of failure!

**Multi-sig benefits:**
- ✅ Require 2-of-3 hoặc 3-of-5 signatures
- ✅ Ngăn chặn hacker đánh cắp 1 key
- ✅ Ngăn chặn inside attacks
- ✅ Shared responsibility
- ✅ Audit trail

### **Setup Gnosis Safe (Recommended)**

```javascript
// 1. Tạo Safe Wallet tại https://app.safe.global/

// 2. Cấu hình owners & threshold
Owners: [
  "0x123... (CEO - Hardware Wallet)",
  "0x456... (CTO - Hardware Wallet)", 
  "0x789... (CFO - Hardware Wallet)"
]
Threshold: 2 of 3 signatures required

// 3. Fund Safe với deployment gas

// 4. Deploy contracts từ Safe
// Install: npm install @safe-global/safe-core-sdk
const Safe = require('@safe-global/safe-core-sdk').default;
const EthersAdapter = require('@safe-global/safe-ethers-lib').default;

// Create transaction
const safeTransactionData = {
  to: contractFactory.address,
  value: '0',
  data: contractFactory.interface.encodeFunctionData('deployContract', [params])
};

// Propose transaction (Owner 1)
const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
await safeSdk.signTransaction(safeTransaction);

// Sign transaction (Owner 2)
await safeSdk.signTransaction(safeTransaction);

// Execute when threshold met
await safeSdk.executeTransaction(safeTransaction);
```

### **Hardware Wallet Integration**

```bash
# Install Hardhat Ledger plugin
npm install --save-dev @nomicfoundation/hardhat-ledger

# hardhat.config.js
module.exports = {
  networks: {
    pioneZero: {
      url: "https://rpc.zeroscan.org",
      ledgerAccounts: [
        "0x...", // Ledger address
      ],
    }
  }
};

# Deploy với Ledger
npx hardhat run scripts/deploy.js --network pioneZero --ledger
```

---

## 🏛️ **VAULT & HSM INTEGRATION**

### **AWS Secrets Manager**

```javascript
// backend/config/secrets.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({
  region: 'us-east-1'
});

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  
  return JSON.parse(data.SecretString);
}

// Usage
const secrets = await getSecret('eduwallet/prod/all');
const jwtSecret = secrets.JWT_SECRET;
```

### **Azure Key Vault**

```javascript
// backend/config/secrets.js
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const vaultName = "eduwallet-vault";
const url = `https://${vaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

async function getSecret(secretName) {
  const secret = await client.getSecret(secretName);
  return secret.value;
}

// Usage
const jwtSecret = await getSecret("jwt-secret");
```

### **HashiCorp Vault**

```javascript
// backend/config/secrets.js
const vault = require("node-vault")({
  endpoint: 'http://vault.company.com:8200',
  token: process.env.VAULT_TOKEN
});

async function getSecret(path) {
  const result = await vault.read(path);
  return result.data;
}

// Usage
const secrets = await getSecret('secret/eduwallet/prod');
const jwtSecret = secrets.JWT_SECRET;
```

---

## 🚀 **QUY TRÌNH TRIỂN KHAI**

### **Pre-Deployment Checklist**

```bash
# 1. Security Audit
□ Run: npm audit
□ Run: npm audit fix
□ Check dependencies for known vulnerabilities

# 2. Code Review
□ No hardcoded secrets
□ All .env files in .gitignore
□ Using vault for production secrets
□ Multi-sig wallet configured

# 3. Environment Verification
□ Separate wallets for dev/staging/prod
□ Different JWT secrets per environment
□ MongoDB authentication enabled
□ CORS configured correctly
□ Rate limiting enabled
□ HTTPS/TLS enabled

# 4. Backup
□ Private keys backed up offline
□ Database backed up
□ Recovery procedures documented
```

### **Deployment Steps**

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production (với multi-sig approval)
# Step 1: Propose deployment
npm run deploy:propose

# Step 2: Team members approve (2-of-3)
# Each owner signs via Gnosis Safe UI

# Step 3: Execute after threshold met
npm run deploy:execute
```

---

## 🔒 **MẬT KHẨU & SECRETS REQUIREMENTS**

### **Độ mạnh tối thiểu:**

```
JWT Secrets:
- Min 64 characters
- Random hex string
- Generate: crypto.randomBytes(64).toString('hex')

Admin Passwords:
- Min 12 characters
- Include: uppercase, lowercase, numbers, symbols
- No dictionary words
- Use password manager

Private Keys:
- 64 hex characters (256-bit)
- Generated by crypto wallet
- NEVER typed manually

API Keys:
- Provider-generated
- Read-only when possible
- Rate-limited
- Monitor usage
```

---

## 🚨 **BÁO CÁO LỖ HỔNG**

### **Nếu phát hiện lỗ hổng bảo mật:**

**🔴 CRITICAL (Private key exposed, SQL injection, etc.)**
1. **NGAY LẬP TỨC** email: security@eduwallet.com
2. **KHÔNG** public issue trên GitHub
3. Team sẽ respond trong 24h
4. Rotate tất cả credentials
5. Deploy hotfix ASAP

**🟡 MEDIUM (Rate limiting bypass, etc.)**
1. Create private security advisory on GitHub
2. Email: security@eduwallet.com
3. Team sẽ respond trong 48h
4. Fix trong next release

**🟢 LOW (Outdated dependency, etc.)**
1. Create GitHub issue với label "security"
2. Team sẽ review trong 7 ngày

---

## 📚 **RESOURCES**

### **Tools**

- **Secret Scanning:** [GitGuardian](https://www.gitguardian.com/)
- **Dependency Audit:** `npm audit`, [Snyk](https://snyk.io/)
- **Multi-Sig Wallet:** [Gnosis Safe](https://app.safe.global/)
- **Hardware Wallets:** [Ledger](https://www.ledger.com/), [Trezor](https://trezor.io/)

### **Documentation**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/)

---

## ✅ **COMPLIANCE CHECKLIST**

```
□ Private keys NOT in git
□ .env files in .gitignore
□ Separate environments (dev/staging/prod)
□ Strong secrets (min 64 chars for JWT)
□ Multi-sig enabled for production
□ Secrets rotation schedule (90 days)
□ Audit logging enabled
□ Backups encrypted & offline
□ Team trained on security procedures
□ Incident response plan documented
□ Regular security audits scheduled
□ Dependency scanning automated
□ HTTPS/TLS enabled
□ MongoDB authentication enabled
□ Rate limiting configured
□ CORS properly configured
```

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Contact:** security@eduwallet.com
