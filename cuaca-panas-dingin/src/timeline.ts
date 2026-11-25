import { Easing, interpolate } from "remotion";

export const FPS = 60;
export const DURATION_S = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Semua waktu dalam detik. Musik (scripts/make_music.py) dikunci ke angka yang sama:
 * 120 BPM -> 1 ketukan = 0.5 s, 1 bar = 2 s.
 */
export const T = {
  hookHot: 0,
  hookCold: 1.8,
  hookLabil: 3.6,
  nov: 6,
  fakta: 10,
  elnino: 14,
  kenapa: 18,
  diagram: 22,
  blackout: 25.75,
  boom: 26,
  anjlok: 28,
  alert: 33,
  tips: 40,
  intinya: 52,
  cta: 56,
  end: 60,
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 = panas terik, 1 = dingin/hujan. Mengatur langit, matahari, awan, embun beku. */
export const coldness = (t: number) =>
  interpolate(
    t,
    [0, 1.75, 1.95, 3.5, 3.75, 22, 25.75, 26, 52, 55.9, 56, 60],
    [0, 0, 1, 1, 0, 0, 0.45, 1, 1, 0.8, 0, 0],
    { ...clamp, easing: easeInOut },
  );

/** Intensitas hujan 0..1 */
export const rainAmount = (t: number) =>
  interpolate(
    t,
    [1.8, 2.0, 3.4, 3.7, 25.95, 26.3, 40, 41, 52, 55.9, 56],
    [0, 1, 1, 0, 0, 1, 1, 0.45, 0.6, 0.6, 0],
    clamp,
  );

/** Suhu yang tampil di HUD */
export const temperature = (t: number) => Math.round(35 - 10 * coldness(t));

const IMPACTS = [
  { t: 0, a: 16 },
  { t: 1.8, a: 12 },
  { t: 26, a: 38 },
  { t: 33, a: 8 },
  { t: 40, a: 10 },
  { t: 56, a: 16 },
];

/** Guncangan kamera saat beat drop / petir */
export const shake = (t: number) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const i of IMPACTS) {
    const dt = t - i.t;
    if (dt >= 0 && dt < 0.8) {
      const e = Math.exp(-dt * 6.5) * i.a;
      x += e * Math.sin(dt * 83);
      y += e * Math.cos(dt * 71);
      r += e * 0.018 * Math.sin(dt * 57);
    }
  }
  return { x, y, r };
};

const CUTS = [0, 1.8, 3.6, 6, 10, 14, 18, 20, 22, 26, 28, 30.5, 33, 40, 43, 46, 49, 52, 54.3, 56];

/** "Zoom punch" kecil di setiap pergantian adegan, ngikut ketukan */
export const punch = (t: number) => {
  let p = 0;
  for (const c of CUTS) {
    const dt = t - c;
    if (dt >= 0 && dt < 0.6) p += 0.045 * Math.exp(-dt * 9);
  }
  return 1 + p;
};

const FLASHES = [
  { t: 1.8, a: 0.55 },
  { t: 26.0, a: 1 },
  { t: 26.14, a: 0.7 },
  { t: 26.42, a: 0.35 },
  { t: 33.0, a: 0.3 },
];

export const flash = (t: number) => {
  let f = 0;
  for (const i of FLASHES) {
    const dt = t - i.t;
    if (dt >= 0 && dt < 0.7) f += i.a * Math.exp(-dt * 13);
  }
  return Math.min(1, f);
};

/** Denyut halus di setiap ketukan (120 BPM) */
export const beatPulse = (t: number) => {
  const ph = (t % 0.5) / 0.5;
  return Math.exp(-ph * 6);
};
