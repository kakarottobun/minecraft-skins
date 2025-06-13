const fs = require("fs");
const path = require("path");

module.exports = (app, skinDir, capeDir) => {
  app.get("/gallery", (req, res) => {
    const host = `${req.protocol}://${req.get("host")}`;

    const skins = fs.existsSync(skinDir)
      ? fs
          .readdirSync(skinDir)
          .filter((f) => f.endsWith(".png"))
          .map((f) => path.parse(f).name.toLowerCase())
      : [];

    const capes = fs.existsSync(capeDir)
      ? fs
          .readdirSync(capeDir)
          .filter((f) => f.endsWith(".png"))
          .map((f) => path.parse(f).name.toLowerCase())
      : [];

    const users = Array.from(new Set([...skins, ...capes])).sort();

    const rows = users
      .map((name) => {
        const skinUrl = `${host}/uploads/skins/${name}.png`;
        const capeUrl = fs.existsSync(path.join(capeDir, `${name}.png`))
          ? `${host}/uploads/capes/${name}.png`
          : null;

        return `
        <tr>
          <td>${name}</td>
          <td><img src="${skinUrl}" height="100"></td>
          <td>${capeUrl ? `<img src="${capeUrl}" height="100">` : "—"}</td>
          <td><button onclick="show3D('${skinUrl}', '${
          capeUrl || ""
        }')">View 3D</button></td>
        </tr>
      `;
      })
      .join("");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Minecraft Skin Gallery</title>
        <script src="/libs/skinview3d.bundle.js"></script>
        <style>
          body { font-family: monospace; background: #1d1d1d; color: #0f0; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #0f0; padding: 10px; text-align: center; }
          img { image-rendering: pixelated; }
          #viewer-container {
            display: none;
            position: fixed;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 80%;
            background: black;
            border: 2px solid #0f0;
            z-index: 999;
            box-sizing: border-box;
          }
          canvas#viewer {
            width: 100%;
            height: 100%;
            display: block;
            background: black;
          }
          #closeBtn {
            position: absolute;
            top: 10px;
            right: 20px;
            cursor: pointer;
            color: #0f0;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <h2>🧍 Minecraft Skins & Capes</h2>
        <table>
          <tr><th>User</th><th>Skin</th><th>Cape</th><th>3D</th></tr>
          ${rows}
        </table>
        <br>
        <a href="/" style="color:#0f0">⬅ Back to Upload</a>

        <div id="viewer-container">
          <div id="closeBtn" onclick="hide3D()">✖</div>
          <canvas id="viewer"></canvas>
        </div>

        <script>
          let viewer = null;

          function show3D(skinUrl, capeUrl) {
            const container = document.getElementById("viewer-container");
            const canvas = document.getElementById("viewer");

            container.style.display = "block";

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            if (viewer) viewer.dispose();

            viewer = new skinview3d.SkinViewer({
              canvas: canvas,
              width: canvas.width,
              height: canvas.height,
              skin: skinUrl
            });

            viewer.controls.enableZoom = true;
            viewer.controls.enableRotate = true;
            viewer.animation = new skinview3d.IdleAnimation();

            if (capeUrl) {
              viewer.loadCape(capeUrl).catch(err => {
                console.error("Failed to load cape:", err);
              });
            }
          }

          function hide3D() {
            document.getElementById("viewer-container").style.display = "none";
            if (viewer) {
              viewer.dispose();
              viewer = null;
            }
          }

          window.addEventListener("resize", () => {
            if (viewer && document.getElementById("viewer-container").style.display === "block") {
              const canvas = document.getElementById("viewer");
              canvas.width = canvas.parentElement.clientWidth;
              canvas.height = canvas.parentElement.clientHeight;
              viewer.setSize(canvas.width, canvas.height);
            }
          });
        </script>
      </body>
      </html>
    `);
  });
};
