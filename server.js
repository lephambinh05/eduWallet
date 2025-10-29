import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/course/progress", (req, res) => {
  console.log("📩 Nhận dữ liệu:", req.body);
  res.json({ status: "ok", received: req.body });
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
