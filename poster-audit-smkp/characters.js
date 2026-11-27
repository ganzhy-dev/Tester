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

function character({ x, y, s = 1, shirt, pants = "#1f3550", skin, hijab, vest, pose, glasses, flip = false, mouth = "open" }) {
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
  g += ns("path", { d: `M-10 ${hh - 88} L-10 ${hh - 2} M10 ${hh - 88} L10 ${hh - 2}`, stroke: "#d5dde3", "stroke-width": 6 });
  g += ns("rect", { x: -100, y: hh - 8, width: 200, height: 20, rx: 10, fill: "#ffffff", ...S });
  g += `<g transform="translate(-58 ${hh - 58}) scale(.62)"><path d="M22 2 C30 14 42 24 42 36 A20 18 0 0 1 2 36 C2 24 14 14 22 2 Z" fill="url(#gd)" stroke="${INK}" stroke-width="4"/></g>`;
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

function scene() {
  // viewBox 1080 x 1920 (latar penuh versi HP, gaya bombastis)
  let s = "";
  s += `<defs>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff1c9" stop-opacity="1"/><stop offset=".3" stop-color="#ffb866" stop-opacity=".75"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
    <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a6f78"/><stop offset="1" stop-color="#0c4a56"/></linearGradient>
    <radialGradient id="rayMask" cx="0.5" cy="0.5" r="0.5"><stop offset=".15" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="rm"><rect x="0" y="0" width="1080" height="1920" fill="url(#rayMask)"/></mask>
  </defs>`;
  // sinar sunburst
  const cx = 540, cy = 900;
  let rays = "";
  for (let i = 0; i < 28; i++) {
    const a0 = (i / 28) * Math.PI * 2, a1 = a0 + Math.PI / 28;
    rays += `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * 1400} ${cy + Math.sin(a0) * 1400} L${cx + Math.cos(a1) * 1400} ${cy + Math.sin(a1) * 1400} Z"/>`;
  }
  s += `<g fill="#ffd36b" opacity=".16" mask="url(#rm)">${rays}</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="420" fill="url(#sun)" opacity=".85"/>`;
  // jenjang tambang
  s += `<path d="M0 1080 L120 1080 L150 1058 L320 1058 L350 1036 L540 1036 L570 1014 L740 1014 L770 996 L1080 996 L1080 1300 L0 1300 Z" fill="#0b4752"/>`;
  s += `<path d="M0 1150 L190 1150 L220 1126 L450 1126 L480 1106 L680 1106 L710 1088 L1080 1088 L1080 1300 L0 1300 Z" fill="url(#bench)"/>`;
  s += `<path d="M220 1126 L450 1126 L480 1106 L680 1106 L710 1088 L1080 1088 L1080 1100 L716 1100 L686 1118 L486 1118 L456 1138 L226 1138 L190 1162 L0 1162 L0 1150 L190 1150 Z" fill="#1b1d22" opacity=".85"/>`;
  s += `<g transform="translate(60 1062) scale(.55)">
     <rect x="0" y="0" width="120" height="46" rx="6" fill="#f2b632" stroke="${INK}" stroke-width="6"/>
     <path d="M-6 0 L130 -10 L112 -46 L6 -40 Z" fill="#f2b632" stroke="${INK}" stroke-width="6"/>
     <rect x="120" y="-16" width="40" height="62" rx="6" fill="#f2b632" stroke="${INK}" stroke-width="6"/>
     <rect x="128" y="-8" width="22" height="18" rx="3" fill="#bfe6ef" stroke="${INK}" stroke-width="4"/>
     <circle cx="28" cy="56" r="22" fill="#1b1d22" stroke="${INK}" stroke-width="6"/><circle cx="132" cy="56" r="22" fill="#1b1d22" stroke="${INK}" stroke-width="6"/>
     <path d="M2 -36 Q40 -66 100 -44" fill="#1b1d22"/>
  </g>`;
  s += dropCluster(-30, 1080, 1.1, -8);
  s += dropCluster(985, 1010, 0.8, 14);
  // karakter (urutan gambar: tengah dulu supaya tangan kiri-kanan tampil di depan)
  s += character({ x: 548, y: 1262, s: 1.2, shirt: "#0f7f86", pose: "clipboard", skin: SKIN[2], hijab: "#1f3550" });
  s += character({ x: 800, y: 1250, s: 1.22, shirt: "#1f3550", vest: true, pose: "magnifier", skin: SKIN[1], glasses: true, mouth: "smile" });
  s += character({ x: 262, y: 1250, s: 1.22, shirt: "#0f7f86", pose: "thumbs", skin: SKIN[0], glasses: true });
  return s;
}

document.getElementById("scene").innerHTML = scene();
