const fs = require("fs");
const p = "/www/wwwroot/api-eduwallet.mojistudio.vn/.env";
if (!fs.existsSync(p)) {
  console.log("NO_ENV_FILE");
  process.exit(0);
}
const s = fs.readFileSync(p, "utf8");
const m = s.match(/^PRIVATE_KEY=(.*)$/m);
if (!m) {
  console.log("PRIVATE_KEY_NOT_SET");
  process.exit(0);
}
const v = m[1].trim().replace(/\r$/, "");
console.log(
  "PRIVATE_KEY_LEN=" + v.length + ";STARTS_0X=" + (v.startsWith("0x") ? 1 : 0)
);
