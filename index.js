const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

// Config from .env
const INTERVAL = parseInt(process.env.INTERVAL_MS) || 50000;
let urls = [];

const app = express();
const PORT = process.env.PORT || 3000;

// Upload folders
const skinDir = path.join(__dirname, "public/uploads/skins");
const capeDir = path.join(__dirname, "public/uploads/capes");
[skinDir, capeDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve files statically
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Multer setup for both skin and cape
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === "skin" ? skinDir : capeDir;
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const username = req.body.username?.trim().toLowerCase();
    if (!username) return cb(new Error("Username required"), "");
    cb(null, `${username}.png`);
  },
});

const upload = multer({ storage }).fields([
  { name: "skin", maxCount: 1 },
  { name: "cape", maxCount: 1 },
]);

// Home page with single form
app.get("/", (req, res) => {
  res.send(`
    <h2>Minecraft Skin/Cape Upload</h2>

    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="text" name="username" placeholder="Username" required /><br><br>
      <label>Skin:</label>
      <input type="file" name="skin" accept="image/*" /><br><br>
      <label>Cape:</label>
      <input type="file" name="cape" accept="image/*" /><br><br>
      <button type="submit">Upload Skin & Cape</button>
    </form>

    <hr />

    <h3>📦 Download CustomSkinLoader Config</h3>
    <p>This file is used by <strong>CustomSkinLoader mod</strong> to load skins and capes from this server.<br>
    Place it in: <code>.minecraft/CustomSkinLoader/CustomSkinLoader.json</code></p>
    
    <a href="/CustomSkinLoader.json" download="CustomSkinLoader.json">
      <button>Download CustomSkinLoader.json</button>
    </a>
  `);
});

// Combined upload route
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.send("Upload failed: " + err.message);
    const username = req.body.username.trim().toLowerCase();

    const host = `${req.protocol}://${req.get("host")}`;
    let output = `<h3>Upload Result for ${username}</h3>`;

    if (req.files.skin) {
      const skinUrl = `${host}/uploads/skins/${username}.png`;
      output += `
        <p>Skin uploaded: <a href="${skinUrl}" target="_blank">${skinUrl}</a></p>
        <img src="${skinUrl}" style="max-width:200px;" /><br>
        <a href="${skinUrl}" download="${username}_skin.png"><button>Download Skin</button></a><br><br>
      `;
    }

    if (req.files.cape) {
      const capeUrl = `${host}/uploads/capes/${username}.png`;
      output += `
        <p>Cape uploaded: <a href="${capeUrl}" target="_blank">${capeUrl}</a></p>
        <img src="${capeUrl}" style="max-width:200px;" /><br>
        <a href="${capeUrl}" download="${username}_cape.png"><button>Download Cape</button></a><br><br>
      `;
    }

    if (!req.files.skin && !req.files.cape) {
      output += "<p>No skin or cape uploaded.</p>";
    }

    res.send(output);
  });
});

// Send health-check to all URLs
const pingHealthChecks = async () => {
  console.log("Pinging URLs...");
  for (const base of urls) {
    const url = `${base}/health-check`;
    try {
      const res = await axios.get(url);
      console.log(`✅ ${url} → ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`❌ ${url} → ${err.message}`);
    }
  }
};

// Start the interval
setInterval(pingHealthChecks, INTERVAL);

// Self health check endpoint
app.get("/health-check", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
