import "./brand";
import React from "react";
import { AbsoluteFill } from "remotion";
import { BODY, C, HEAD, OUTLINE } from "./brand";
import { HalusVariant, SiHalus } from "./Characters";

type Ep = {
  n: number;
  title: string;
  ghost: HalusVariant;
  ghostName: string;
  palette: string[];
  hook: string;
  heart: string;
  scenes: string;
  mood: string;
};

const EPS: Ep[] = [
  {
    n: 10,
    title: "JANGAN LANGSUNG PEGANG!",
    ghost: "volt",
    ghostName: "Listrik Nyasar",
    palette: ["#F3C98B", "#FFB21A", "#7A4A00", "#E8634A", "#FFEFD9"],
    hook: "“Seorang ibu lari nolongin anaknya yang kesetrum… dan dua-duanya nggak selamat.”",
    heart: "“Ibu itu nggak salah. Dia cuma ngelakuin yang semua ibu bakal lakuin.”",
    scenes: "🧺 jemuran kawat · 🏚️ seng + kabel putus · ⚡ MCB OFF · 🧹 sapu kering · 🔌 colokan kayak sate · 🌊 banjir",
    mood: "tegang → hangat",
  },
  {
    n: 11,
    title: "100 JAM SEMINGGU, TANPA GAJI",
    ghost: "load",
    ghostName: "Beban Tak Kelihatan",
    palette: ["#E3C4D6", "#A77BC9", "#5A2E6E", "#F2A07B", "#FFEFD9"],
    hook: "“Ada pekerjaan yang jamnya bisa seratus jam seminggu… dan kamu manggilnya: Ibu.”",
    heart: "“Ibu nggak minta digaji. Dia cuma butuh dibantu… dan dibilang makasih.”",
    scenes: "⏰ jam berputar · 🍳 subuh · 🧺 ember & galon · 🦵 lutut & pinggang · 🛌 tidur terpotong · 🤝 angkat berdua",
    mood: "haru → lega",
  },
  {
    n: 12,
    title: "LANTAI KAMAR MANDI BASAH?",
    ghost: "slip",
    ghostName: "Lantai Licin",
    palette: ["#BFDCCB", "#2FA7B8", "#1F5A57", "#F5C451", "#FFEFD9"],
    hook: "“Satu langkah di lantai kamar mandi yang licin… bisa bikin orang tua kita nggak bisa jalan lagi.”",
    heart: "“Dulu mereka yang megangin tangan kita belajar jalan. Sekarang… giliran kita.”",
    scenes: "🌙 malam & lampu redup · 💧 lantai basah · 🦴 tulang panggul · 🧽 keset anti-slip · 🪜 pegangan · 💡 lampu malam",
    mood: "sunyi → hangat",
  },
];

const Row: React.FC<{ e: Ep; top: number }> = ({ e, top }) => (
  <div style={{ position: "absolute", top, left: 40, right: 40, height: 540, background: "#FFF6EA", border: `5px solid ${e.palette[1]}`, boxShadow: `0 10px 0 ${e.palette[1]}55`, borderRadius: 40, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, background: `radial-gradient(circle at 50% 45%, ${e.palette[0]}AA, ${e.palette[0]}33 70%)` }} />
    <div style={{ position: "absolute", left: 26, top: 70 }}>
      <SiHalus size={300} variant={e.ghost} mood="grin" />
    </div>
    <div style={{ position: "absolute", left: 40, top: 22, fontFamily: HEAD, fontSize: 40, color: e.palette[1], WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" }}>EP {e.n}</div>
    <div style={{ position: "absolute", left: 30, top: 410, width: 250, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 28, color: C.ink }}>Si Halus: {e.ghostName}</div>
    <div style={{ position: "absolute", left: 320, right: 30, top: 28 }}>
      <div style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1, color: C.cream, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>{e.title}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {e.palette.map((c) => (
          <div key={c} style={{ width: 58, height: 58, borderRadius: 14, background: c, border: `4px solid ${C.ink}` }} />
        ))}
        <div style={{ marginLeft: 10, alignSelf: "center", fontFamily: BODY, fontWeight: 800, fontSize: 26, color: e.palette[2] }}>mood: {e.mood}</div>
      </div>
      <div style={{ marginTop: 16, fontFamily: BODY, fontWeight: 800, fontSize: 27, lineHeight: 1.2, color: C.ink, background: C.cream, borderRadius: 18, padding: "12px 18px", border: `${OUTLINE - 2}px solid ${C.ink}` }}>
        <span style={{ color: C.pink }}>HOOK </span>
        {e.hook}
      </div>
      <div style={{ marginTop: 12, fontFamily: BODY, fontWeight: 700, fontSize: 25, lineHeight: 1.25, color: C.ink }}>{e.scenes}</div>
      <div style={{ marginTop: 12, fontFamily: BODY, fontWeight: 800, fontSize: 26, lineHeight: 1.2, color: e.palette[2] }}>🤍 {e.heart}</div>
    </div>
  </div>
);

export const Moodboard: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #F6D7A8 0%, #EBCFD6 50%, #CFE2D2 100%)" }}>
    <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.pink }}>MOODBOARD · EP 10–12 · TEMA HANGAT</div>
      <div style={{ fontFamily: HEAD, fontSize: 84, color: C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", marginTop: 6 }}>BAHAYA DI RUMAH SENDIRI</div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.ink, opacity: 0.85 }}>kasus nyata → Si Halus → fakta → cara aman (save) → kalimat haru (share)</div>
    </div>
    <Row e={EPS[0]} top={250} />
    <Row e={EPS[1]} top={810} />
    <Row e={EPS[2]} top={1370} />
  </AbsoluteFill>
);
