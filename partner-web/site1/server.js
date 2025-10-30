const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/result", (req, res) => {
  console.log("Site1 result received:", JSON.stringify(req.body, null, 2));
  // In a real demo you could forward to EduWallet API here.
  res.json({ success: true, message: "Result received" });
});

const port = process.env.PORT || 4001;
app.listen(port, () =>
  console.log(`Partner site1 running on http://localhost:${port}`)
);
