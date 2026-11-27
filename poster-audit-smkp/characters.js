// Ilustrasi poster: lanskap tambang + 3 karakter (gaya kartun, terinspirasi seragam pekerja tambang:
// kemeja toska + strip reflektif, helm putih; auditor dengan rompi oranye). Semua digambar sendiri (SVG).
const INK = "#13263a";
const SKIN = ["#c98b5e", "#b9794f", "#d9a27a"];
const ns = (tag, attrs, inner = "") =>
  `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}>${inner}</${tag}>`;

const limb = (pts, color, w = 30) => {
  const d = "M" + pts.map((p) => p.join(" ")).join(" L");
  return (
    ns("path", { d, fill: "none", stroke: INK, "stroke-width": w + 12, "stroke-linecap": "round", "stroke-linejoin": "round" }) +
    ns("path", { d, fill: "none", stroke: color, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" })
  );
};
const hand = (x, y, skin, r = 17) => ns("circle", { cx: x, cy: y, r, fill: skin, stroke: INK, "stroke-width": 5 });

function character({ x, y, s = 1, shirt, pants = "#1f3550", skin, hijab, vest, pose, glasses, flip = false, mouth = "open", brand = false }) {
  const S = { stroke: INK, "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" };
  let g = "";
  // bayangan
  g += ns("ellipse", { cx: 0, cy: 4, rx: 92, ry: 14, fill: "rgba(0,0,0,.22)" });
  // sepatu & kaki
  g += ns("rect", { x: -46, y: -118, width: 38, height: 112, rx: 14, fill: pants, ...S });
  g += ns("rect", { x: 8, y: -118, width: 38, height: 112, rx: 14, fill: pants, ...S });
  g += ns("path", { d: "M-58 -2 Q-58 -26 -30 -26 L-6 -26 L-6 -2 Z", fill: "#3b2a20", ...S });
  g += ns("path", { d: "M58 -2 Q58 -26 30 -26 L6 -26 L6 -2 Z", fill: "#3b2a20", ...S });
  // strip reflektif celana
  g += ns("rect", { x: -44, y: -64, width: 34, height: 9, fill: "#d6f23a" });
  g += ns("rect", { x: 10, y: -64, width: 34, height: 9, fill: "#d6f23a" });

  // lengan belakang (digambar sebelum badan)
  const sh = 72;
  const armBack = [];
  if (pose === "clipboard") {
    armBack.push(limb([[-sh + 8, -232], [-92, -170], [-48, -150]], shirt));
  } else if (pose === "magnifier") {
    armBack.push(limb([[-sh + 8, -232], [-94, -170], [-86, -120]], vest ? "#1f3550" : shirt));
  } else {
    armBack.push(limb([[-sh + 8, -232], [-96, -176], [-92, -124]], shirt));
  }
  g += armBack.join("");

  // badan
  g += ns("rect", { x: -74, y: -262, width: 148, height: 160, rx: 40, fill: shirt, ...S });
  if (vest) {
    g += ns("path", { d: "M-74 -222 Q-74 -262 -36 -262 L-14 -262 L-14 -104 L-70 -104 Q-74 -104 -74 -120 Z", fill: "#f28a2e", ...S });
    g += ns("path", { d: "M74 -222 Q74 -262 36 -262 L14 -262 L14 -104 L70 -104 Q74 -104 74 -120 Z", fill: "#f28a2e", ...S });
    g += ns("rect", { x: -71, y: -166, width: 54, height: 14, fill: "#d6f23a" }) + ns("rect", { x: 17, y: -166, width: 54, height: 14, fill: "#d6f23a" });
    g += ns("rect", { x: -71, y: -161, width: 54, height: 4, fill: "#e8eef2" }) + ns("rect", { x: 17, y: -161, width: 54, height: 4, fill: "#e8eef2" });
    g += ns("rect", { x: -62, y: -238, width: 44, height: 22, rx: 5, fill: "#fff", stroke: INK, "stroke-width": 3 });
    g += ns("text", { x: -40, y: -222, "text-anchor": "middle", "font-family": "Inter", "font-weight": 900, "font-size": 10, fill: INK }, "AUDITOR");
  } else if (brand) {
    // seragam gaya AlamTri: navy, panel toska di sisi, 2 strip reflektif, logo putih di dada
    g += ns("path", { d: "M-74 -222 Q-74 -262 -40 -262 L-40 -102 L-74 -102 Z", fill: "#12707e" });
    g += ns("path", { d: "M74 -222 Q74 -262 40 -262 L40 -102 L74 -102 Z", fill: "#12707e" });
    for (const yy of [-214, -176]) {
      g += ns("rect", { x: -71, y: yy, width: 142, height: 15, fill: "#d6f23a" });
      g += ns("rect", { x: -71, y: yy + 5.5, width: 142, height: 4, fill: "#eef3f6" });
    }
    g += ns("image", { href: "assets/alamtri_white.png", x: -30, y: -250, width: 60, height: 12.3 });
    g += ns("rect", { x: -74, y: -262, width: 148, height: 160, rx: 40, fill: "none", ...S });
  } else {
    // strip reflektif kemeja (horizontal + bahu)
    g += ns("rect", { x: -71, y: -168, width: 142, height: 16, fill: "#d6f23a" });
    g += ns("rect", { x: -71, y: -162, width: 142, height: 4, fill: "#e8eef2" });
    g += ns("rect", { x: -44, y: -258, width: 14, height: 92, fill: "#d6f23a" }) + ns("rect", { x: 30, y: -258, width: 14, height: 92, fill: "#d6f23a" });
    // saku dengan tetes kecil
    g += ns("rect", { x: 14, y: -228, width: 40, height: 34, rx: 6, fill: "rgba(0,0,0,.12)" });
    g += `<g transform="translate(26 -224) scale(.42)"><path d="M22 2 C30 14 42 24 42 36 A20 18 0 0 1 2 36 C2 24 14 14 22 2 Z" fill="#fff"/></g>`;
  }
  g += ns("rect", { x: -74, y: -116, width: 148, height: 14, fill: "#10202f" });

  // lengan depan
  if (pose === "thumbs") {
    g += limb([[sh - 8, -232], [118, -196], [124, -258]], shirt);
    g += ns("rect", { x: 104, y: -226, width: 30, height: 9, fill: "#d6f23a", transform: "rotate(-70 119 -222)" });
    g += hand(124, -264, skin, 20);
    g += ns("rect", { x: 117, y: -312, width: 15, height: 34, rx: 7, fill: skin, stroke: INK, "stroke-width": 5 });
    g += hand(-92, -122, skin);
  } else if (pose === "clipboard") {
    // papan klip
    g += ns("rect", { x: -54, y: -236, width: 108, height: 136, rx: 10, fill: "#9a6a3e", ...S });
    g += ns("rect", { x: -42, y: -222, width: 84, height: 112, rx: 4, fill: "#fff", stroke: INK, "stroke-width": 3 });
    g += ns("rect", { x: -20, y: -244, width: 40, height: 16, rx: 5, fill: "#c4ccd4", stroke: INK, "stroke-width": 4 });
    for (let i = 0; i < 4; i++) {
      const yy = -204 + i * 24;
      g += ns("path", { d: `M-32 ${yy} l6 7 l11 -13`, fill: "none", stroke: "#3aa65b", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" });
      g += ns("rect", { x: -8, y: yy - 4, width: 40, height: 6, rx: 3, fill: "#b9c3cc" });
    }
    g += limb([[sh - 8, -232], [96, -170], [52, -150]], shirt);
    g += hand(-50, -150, skin) + hand(52, -150, skin);
  } else if (pose === "magnifier") {
    g += limb([[sh - 8, -232], [124, -214], [132, -272]], vest ? "#1f3550" : shirt);
    g += ns("path", { d: "M134 -280 L150 -330", stroke: "#6b4a2c", "stroke-width": 14, "stroke-linecap": "round", fill: "none" });
    g += ns("circle", { cx: 158, cy: -362, r: 38, fill: "rgba(173,231,240,.55)", stroke: INK, "stroke-width": 9 });
    g += ns("path", { d: "M140 -376 Q146 -390 162 -392", stroke: "#fff", "stroke-width": 6, fill: "none", "stroke-linecap": "round" });
    g += hand(132, -276, skin, 19);
    g += hand(-86, -118, skin);
  }

  // kepala
  const hy = -350;
  if (hijab) {
    g += ns("path", { d: `M-90 ${hy} Q-96 ${hy + 96} -66 ${hy + 104} L66 ${hy + 104} Q96 ${hy + 96} 90 ${hy} Q90 ${hy - 92} 0 ${hy - 92} Q-90 ${hy - 92} -90 ${hy} Z`, fill: hijab, ...S });
    g += ns("ellipse", { cx: 0, cy: hy + 6, rx: 62, ry: 70, fill: skin, ...S });
  } else {
    g += ns("rect", { x: -18, y: hy + 60, width: 36, height: 34, fill: skin, ...S });
    g += ns("circle", { cx: -74, cy: hy + 6, r: 15, fill: skin, ...S }) + ns("circle", { cx: 74, cy: hy + 6, r: 15, fill: skin, ...S });
    g += ns("circle", { cx: 0, cy: hy, r: 76, fill: skin, ...S });
    g += ns("path", { d: `M-70 ${hy - 6} Q-74 ${hy + 24} -62 ${hy + 30} L-56 ${hy - 6} Z`, fill: "#1b1b24" });
    g += ns("path", { d: `M70 ${hy - 6} Q74 ${hy + 24} 62 ${hy + 30} L56 ${hy - 6} Z`, fill: "#1b1b24" });
  }
  // wajah
  const ey = hy + 8;
  g += ns("ellipse", { cx: -26, cy: ey, rx: 9, ry: 12, fill: INK }) + ns("ellipse", { cx: 26, cy: ey, rx: 9, ry: 12, fill: INK });
  g += ns("circle", { cx: -23, cy: ey - 4, r: 3.4, fill: "#fff" }) + ns("circle", { cx: 29, cy: ey - 4, r: 3.4, fill: "#fff" });
  g += ns("path", { d: `M-40 ${ey - 24} Q-26 ${ey - 32} -12 ${ey - 25}`, fill: "none", stroke: INK, "stroke-width": 6, "stroke-linecap": "round" });
  g += ns("path", { d: `M40 ${ey - 24} Q26 ${ey - 32} 12 ${ey - 25}`, fill: "none", stroke: INK, "stroke-width": 6, "stroke-linecap": "round" });
  if (glasses) {
    g += ns("rect", { x: -48, y: ey - 18, width: 40, height: 32, rx: 12, fill: "rgba(160,220,235,.35)", stroke: INK, "stroke-width": 5 });
    g += ns("rect", { x: 8, y: ey - 18, width: 40, height: 32, rx: 12, fill: "rgba(160,220,235,.35)", stroke: INK, "stroke-width": 5 });
    g += ns("path", { d: `M-8 ${ey - 4} L8 ${ey - 4}`, stroke: INK, "stroke-width": 5 });
  }
  g += ns("ellipse", { cx: -46, cy: ey + 26, rx: 13, ry: 8, fill: "#f08a8a", opacity: 0.55 }) + ns("ellipse", { cx: 46, cy: ey + 26, rx: 13, ry: 8, fill: "#f08a8a", opacity: 0.55 });
  if (mouth === "open") {
    g += ns("path", { d: `M-24 ${ey + 30} Q0 ${ey + 62} 24 ${ey + 30} Z`, fill: "#7a2333", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" });
    g += ns("path", { d: `M-12 ${ey + 44} Q0 ${ey + 38} 12 ${ey + 44} Q0 ${ey + 54} -12 ${ey + 44} Z`, fill: "#e8697a" });
  } else {
    g += ns("path", { d: `M-20 ${ey + 34} Q0 ${ey + 50} 20 ${ey + 34}`, fill: "none", stroke: INK, "stroke-width": 6, "stroke-linecap": "round" });
  }
  // helm
  const hh = hy - 18;
  g += ns("path", { d: `M-84 ${hh} Q-84 ${hh - 86} 0 ${hh - 90} Q84 ${hh - 86} 84 ${hh} Z`, fill: "#ffffff", ...S });
  g += ns("path", { d: brand ? `M-10 ${hh - 88} L-10 ${hh - 70} M10 ${hh - 88} L10 ${hh - 70}` : `M-10 ${hh - 88} L-10 ${hh - 2} M10 ${hh - 88} L10 ${hh - 2}`, stroke: "#d5dde3", "stroke-width": 6 });
  g += ns("rect", { x: -100, y: hh - 8, width: 200, height: 20, rx: 10, fill: "#ffffff", ...S });
  if (brand) {
    g += ns("image", { href: "assets/alamtrigeo_navy.png", x: -44, y: hh - 66, width: 88, height: 31.7 });
  } else {
    g += `<g transform="translate(-58 ${hh - 58}) scale(.62)"><path d="M22 2 C30 14 42 24 42 36 A20 18 0 0 1 2 36 C2 24 14 14 22 2 Z" fill="url(#gd)" stroke="${INK}" stroke-width="4"/></g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${g}</g>`;
}

function dropCluster(x, y, s, rot = 0) {
  const d = "M22 2 C30 14 42 24 42 36 A20 18 0 0 1 2 36 C2 24 14 14 22 2 Z";
  const items = [
    [0, 0, 1.6, "#f28a2e"], [58, 30, 1.2, "#5fc3c0"], [12, 70, 1.0, "#0f7f86"], [70, 92, 0.8, "#f6b25e"], [-30, 60, 0.7, "#9fd9d4"],
  ];
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity=".95">${items
    .map(([dx, dy, k, c]) => `<path d="${d}" transform="translate(${dx} ${dy}) scale(${k})" fill="${c}" opacity=".9"/>`)
    .join("")}</g>`;
}

function cloud(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".95"><ellipse cx="0" cy="0" rx="90" ry="38"/><ellipse cx="-60" cy="12" rx="60" ry="30"/><ellipse cx="70" cy="10" rx="70" ry="32"/><ellipse cx="10" cy="-26" rx="58" ry="40"/></g>`;
}

function haulTruck(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k})">
    <path d="M-10 -30 L260 -48 L238 -128 L4 -118 Z" fill="#f5b819" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M20 -116 Q120 -170 230 -124" fill="#2a2c33"/>
    <rect x="-10" y="-34" width="270" height="70" rx="10" fill="#f5b819" stroke="${INK}" stroke-width="7"/>
    <rect x="252" y="-80" width="86" height="116" rx="10" fill="#f5b819" stroke="${INK}" stroke-width="7"/>
    <rect x="266" y="-68" width="56" height="40" rx="6" fill="#bfe6ef" stroke="${INK}" stroke-width="5"/>
    <rect x="236" y="-4" width="110" height="14" fill="${INK}"/>
    ${[40, 120, 290].map((cx) => `<circle cx="${cx}" cy="56" r="50" fill="#1b1d22" stroke="${INK}" stroke-width="7"/><circle cx="${cx}" cy="56" r="22" fill="#8a8f99" stroke="${INK}" stroke-width="5"/>`).join("")}
  </g>`;
}

function scene() {
  // viewBox 1080 x 1920 — versi 3: langit cerah, tambang, haul truck besar, karakter berseragam AlamTri
  let s = "";
  s += `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8fd8"/><stop offset=".55" stop-color="#8fd0f2"/><stop offset="1" stop-color="#e9f6fb"/></linearGradient>
    <linearGradient id="pit1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b79b7a"/><stop offset="1" stop-color="#8a7258"/></linearGradient>
    <linearGradient id="pit2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c8166"/><stop offset="1" stop-color="#6e5946"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<rect x="0" y="0" width="1080" height="1240" fill="url(#sky)"/>`;
  s += cloud(160, 210, 1.1) + cloud(930, 140, 0.9) + cloud(600, 300, 0.7);
  // jenjang tambang (cokelat, seperti foto lokasi)
  s += `<path d="M0 760 L160 740 L200 712 L420 700 L460 676 L700 668 L740 646 L1080 636 L1080 1240 L0 1240 Z" fill="url(#pit1)"/>`;
  s += `<path d="M0 760 L160 740 L200 712 L420 700 L460 676 L700 668 L740 646 L1080 636 L1080 652 L744 662 L704 684 L464 692 L424 716 L204 728 L164 756 L0 776 Z" fill="#5b4a3a" opacity=".6"/>`;
  s += `<path d="M0 860 L230 846 L270 820 L560 810 L600 788 L1080 776 L1080 1240 L0 1240 Z" fill="url(#pit2)"/>`;
  s += `<path d="M0 860 L230 846 L270 820 L560 810 L600 788 L1080 776 L1080 790 L604 802 L564 824 L274 834 L234 860 L0 874 Z" fill="#2a2420" opacity=".75"/>`;
  s += `<path d="M0 1000 L1080 970 L1080 1240 L0 1240 Z" fill="#6b5847"/>`;
  s += `<circle cx="820" cy="760" r="420" fill="url(#glow)" opacity=".7"/>`;
  // debu
  s += `<g fill="#e6d6c0" opacity=".55"><ellipse cx="80" cy="980" rx="160" ry="40"/><ellipse cx="300" cy="1000" rx="120" ry="30"/></g>`;
  s += haulTruck(30, 800, 0.6);
  s += `<g fill="#e6d6c0" opacity=".5"><ellipse cx="60" cy="850" rx="90" ry="22"/></g>`;
  // karakter pendukung (kiri) + karakter utama besar (kanan)
  s += character({ x: 250, y: 1215, s: 0.98, shirt: "#1c3a56", pose: "clipboard", skin: SKIN[2], hijab: "#1f3550", brand: true });
  s += character({ x: 450, y: 1205, s: 1.0, shirt: "#1f3550", vest: true, pose: "magnifier", skin: SKIN[1], glasses: true, mouth: "smile" });
  s += character({ x: 800, y: 1230, s: 1.62, shirt: "#1c3a56", pose: "thumbs", skin: SKIN[0], glasses: true, brand: true });
  return s;
}

document.getElementById("scene").innerHTML = scene();
