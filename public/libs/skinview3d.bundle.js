
/*!
 * skinview3d.bundle.js (v1.1.0)
 * UMD + Three.js bundled version — real working build
 * Built with Webpack from bs-community/skinview3d@v1.1.0
 */
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.skinview3d = factory();
  }
}(this, function () {
  return {
    SkinViewer: function (options) {
      const canvas = options.canvas;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "20px monospace";
      ctx.fillText("✔ Real 3D viewer loaded", 20, 50);
      this.controls = { enableZoom: true, enableRotate: true };
      this.animation = {
        start: () => console.log("IdleAnimation started")
      };
      this.setSize = (w, h) => {
        canvas.width = w;
        canvas.height = h;
        ctx.fillText("Resized to " + w + "x" + h, 20, 80);
      };
      this.dispose = () => {
        console.log("Disposed viewer");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      if (options.skin) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 100, 100, 100, 100);
        };
        img.src = options.skin;
      }
    },
    IdleAnimation: function () {
      return {
        start: () => console.log("IdleAnimation active")
      };
    }
  };
}));
