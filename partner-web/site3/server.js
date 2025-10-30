const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/result", (req, res) => {
  console.log("Site3 result received:", JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: "Result received" });
});

const port = process.env.PORT || 4003;
app.listen(port, () =>
  console.log(`Partner site3 running on http://localhost:${port}`)
);
