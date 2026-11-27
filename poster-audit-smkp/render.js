// Render poster versi HP (1080 x 1920, 9:16).
//   node render.js
// -> output/Poster_Audit_SMKP_HP.png (1080x1920), output/Poster_Audit_SMKP_HP_HD.png (2160x3840),
//    output/Poster_Audit_SMKP_HP.jpg (untuk dibagikan di WhatsApp)
const { chromium } = require("playwright");
const path = require("path");
const out = (f) => path.join(__dirname, "output", f);

(async () => {
  const b = await chromium.launch();
  const url = "file://" + path.join(__dirname, "poster.html");
  const clip = { x: 0, y: 0, width: 1080, height: 1920 };
  for (const [scale, name] of [[2, "Poster_Audit_SMKP_HP_HD.png"], [1, "Poster_Audit_SMKP_HP.png"]]) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
    await p.goto(url, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: out(name), clip });
    if (scale === 1) await p.screenshot({ path: out("Poster_Audit_SMKP_HP.jpg"), type: "jpeg", quality: 95, clip });
  }
  await b.close();
  console.log("ok");
})();
