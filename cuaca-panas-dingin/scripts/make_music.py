"""
Musik orisinal 60 detik untuk video "Panas ke Dingin".
Semua suara disintesis dari nol (tanpa sampel) -> bebas copyright.

120 BPM -> 1 ketukan = 0.5 s = 30 frame @60fps, 1 bar = 2 s.
Timeline (detik) harus sama dengan src/timeline.ts:
  0  - 18  PANAS      tropical house, A mayor
  18 - 26  BIANG KEROK groove di-filter, naik ke build, riser
  25.75    hening sebentar -> 26 PETIR (switch ke dingin)
  26 - 40  DINGIN     half-time, A minor, pad + bel + hujan
  40 - 52  TIPS       four-on-the-floor minor, whoosh tiap tips
  52 - 56  BREAKDOWN
  56 - 60  CTA        balik ke A mayor (loop ke awal)

Pakai:  python3 scripts/make_music.py public/music_raw.wav
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 60.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4

rng = np.random.default_rng(20261125)


# ---------------------------------------------------------------- utils
def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def bus():
    return np.zeros((N, 2))


def add(b, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    if sig.ndim == 1:
        b[i : i + len(sig), 0] += sig * gain * np.cos(a)
        b[i : i + len(sig), 1] += sig * gain * np.sin(a)
    else:
        b[i : i + len(sig)] += sig * gain


def fft_filter(x, kind, fc, fc2=None, order=2):
    n = len(x)
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    f = np.maximum(f, 1e-3)
    if kind == "lp":
        H = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    elif kind == "hp":
        H = 1 / np.sqrt(1 + (fc / f) ** (2 * order))
    else:  # band
        H = (1 / np.sqrt(1 + (fc / f) ** (2 * order))) * (
            1 / np.sqrt(1 + (f / fc2) ** (2 * order))
        )
    if x.ndim == 2:
        H = H[:, None]
    return np.fft.irfft(X * H, n=n, axis=0)


def stft_sweep(x, fc_of_t, kind="lp", order=2, bw=1.0):
    """Filter yang berubah terhadap waktu (overlap-add STFT). x mono."""
    fr, hop = 2048, 512
    win = np.hanning(fr)
    pad = np.concatenate([np.zeros(fr), x, np.zeros(fr)])
    nfr = (len(pad) - fr) // hop + 1
    idx = np.arange(fr)[None, :] + hop * np.arange(nfr)[:, None]
    frames = pad[idx] * win
    F = np.fft.rfft(frames, axis=1)
    f = np.maximum(np.fft.rfftfreq(fr, 1 / SR), 1e-3)[None, :]
    tc = (hop * np.arange(nfr) + fr / 2 - fr) / SR
    fc = np.asarray(fc_of_t(tc), dtype=float)[:, None]
    if kind == "lp":
        H = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    elif kind == "hp":
        H = 1 / np.sqrt(1 + (fc / f) ** (2 * order))
    else:
        lo, hi = fc / (1 + bw), fc * (1 + bw)
        H = (1 / np.sqrt(1 + (lo / f) ** (2 * order))) * (
            1 / np.sqrt(1 + (f / hi) ** (2 * order))
        )
    out_frames = np.fft.irfft(F * H, n=fr, axis=1) * win
    out = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    np.add.at(out, idx.ravel(), out_frames.ravel())
    np.add.at(norm, idx.ravel(), np.tile(win**2, nfr))
    out = out / np.maximum(norm, 1e-6)
    return out[fr : fr + len(x)]


def reverb(x, seconds=2.2, damp=3500, seed=1):
    r = np.random.default_rng(seed)
    t = tt(seconds)
    env = np.exp(-t * 6.9 / seconds)
    ir = np.stack([r.standard_normal(len(t)) * env, r.standard_normal(len(t)) * env], 1)
    ir = fft_filter(ir, "lp", damp)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    ir /= np.sqrt((ir**2).sum(0))
    n = len(x) + len(ir)
    nf = 1 << int(np.ceil(np.log2(n)))
    mono = x.mean(1) if x.ndim == 2 else x
    Xf = np.fft.rfft(mono, nf)
    out = np.stack([np.fft.irfft(Xf * np.fft.rfft(ir[:, c], nf), nf)[: len(x)] for c in (0, 1)], 1)
    return out


def adsr(n, a=0.005, r=0.02):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


# ---------------------------------------------------------- instruments
def kick(d=0.42, punch=1.0):
    t = tt(d)
    f = 46 + 120 * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = fft_filter(rng.standard_normal(len(t)), "hp", 2500) * np.exp(-t * 300) * 0.35
    return np.tanh(1.6 * punch * (s + click)) * adsr(len(t), 0.001, 0.02)


def clap(d=0.35):
    t = tt(d)
    n = rng.standard_normal(len(t))
    env = np.zeros(len(t))
    for o in (0.0, 0.011, 0.022):
        env += (t >= o) * np.exp(-np.maximum(t - o, 0) * 110)
    env += (t >= 0.03) * np.exp(-np.maximum(t - 0.03, 0) * 16) * 0.6
    return fft_filter(n * env, "bp", 900, 5000) * 1.6


def snare(d=0.25):
    t = tt(d)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.6
    n = fft_filter(rng.standard_normal(len(t)), "bp", 1500, 9000) * np.exp(-t * 22)
    return body + n


def hat(d=0.06, dec=70):
    t = tt(d)
    return fft_filter(rng.standard_normal(len(t)), "hp", 7500) * np.exp(-t * dec) * adsr(len(t), 0.001, 0.005)


def shaker(d=0.09):
    t = tt(d)
    env = np.minimum(t / 0.012, 1) * np.exp(-t * 45)
    return fft_filter(rng.standard_normal(len(t)), "bp", 4500, 12000) * env


def marimba(m, d=0.7):
    t = tt(d)
    f = mtof(m)
    s = (
        np.sin(2 * np.pi * f * t) * np.exp(-t * 6)
        + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 20)
        + 0.08 * np.sin(2 * np.pi * 9.8 * f * t) * np.exp(-t * 45)
    )
    return s * adsr(len(t), 0.002, 0.03)


def pluck(m, d=0.45, bright=1.0):
    """Saw pluck aditif: harmonik tinggi meluruh lebih cepat (efek envelope filter)."""
    t = tt(d)
    f = mtof(m)
    s = np.zeros(len(t))
    k = 1
    while k * f < 11000 and k < 40:
        s += np.sin(2 * np.pi * k * f * t) / k * np.exp(-t * (5 + k * 2.2 / bright))
        k += 1
    return s * adsr(len(t), 0.002, 0.03) * 0.8


def bell(m, d=2.2):
    t = tt(d)
    f = mtof(m)
    idx = 3.0 * np.exp(-t * 3)
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t))
    return s * np.exp(-t * 2.0) * adsr(len(t), 0.002, 0.05)


def pad(notes, d, cutoff=2500, detune=0.12):
    t = tt(d)
    s = np.zeros(len(t))
    for m in notes:
        f = mtof(m)
        for v, det in enumerate(np.linspace(-detune, detune, 5)):
            s += saw(f * 2 ** (det / 12), t, phase=rng.random())
    s = fft_filter(s, "lp", cutoff, order=2)
    a = min(0.6, d / 3)
    return s / (len(notes) * 5) * adsr(len(t), a, min(0.5, d / 3)) * 2.2


def sub(m, d):
    t = tt(d)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return np.tanh(1.4 * s) * adsr(len(t), 0.004, 0.03)


def riser(d=2.0):
    t = tt(d)
    n = rng.standard_normal(len(t))
    nf = stft_sweep(n, lambda x: 300 * (8000 / 300) ** np.clip(x / d, 0, 1), kind="bp", bw=0.8)
    f = 220 * (1500 / 220) ** (t / d)
    tone = sum(np.sin(2 * np.pi * np.cumsum(f * 2 ** (dt / 12)) / SR) for dt in (-0.15, 0, 0.15)) / 3
    env = (t / d) ** 2.2
    return (nf * 0.9 + tone * 0.25) * env * adsr(len(t), 0.01, 0.01)


def whoosh(d=0.7):
    t = tt(d)
    n = rng.standard_normal(len(t))
    nf = stft_sweep(n, lambda x: 500 * (5000 / 500) ** np.clip(x / d, 0, 1), kind="bp", bw=0.6)
    return nf * np.sin(np.pi * t / d) ** 2


def impact(d=2.5):
    t = tt(d)
    f = 38 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = fft_filter(rng.standard_normal(len(t)), "lp", 4000) * np.exp(-t * 9) * 0.6
    return np.tanh(1.8 * (boom + n))


def thunder(d=5.0, seed=3):
    r = np.random.default_rng(seed)
    t = tt(d)
    crack = fft_filter(r.standard_normal(len(t)), "hp", 1200) * np.exp(-t * 14) * 0.9
    brown = np.cumsum(r.standard_normal(len(t)))
    brown = fft_filter(brown - brown.mean(), "bp", 25, 260)
    brown /= np.abs(brown).max() + 1e-9
    env = np.zeros(len(t))
    for o, a, dec in ((0.02, 1.0, 1.2), (0.35, 0.7, 1.6), (0.9, 0.55, 1.0), (1.7, 0.4, 0.9)):
        env += a * (t >= o) * np.exp(-np.maximum(t - o, 0) * dec) * np.minimum(np.maximum(t - o, 0) / 0.05, 1)
    return crack + brown * env * 1.4


def rain_bed(d):
    t = tt(d)
    n = fft_filter(rng.standard_normal(len(t)), "bp", 700, 9000, order=1)
    drops = np.zeros(len(t))
    k = int(d * 90)
    pos = rng.integers(0, len(t) - 600, k)
    tick = fft_filter(rng.standard_normal(600), "hp", 3000) * np.exp(-np.arange(600) / 60)
    for p in pos:
        drops[p : p + 600] += tick * rng.uniform(0.2, 1)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t)
    return (n * 0.5 + drops * 0.35) * lfo


# ------------------------------------------------------------ arrangement
drums = bus()
bass = bus()
music = bus()
fx = bus()
kick_times = []

HOT = [  # (pad notes, bass root, arp tones)
    ([57, 61, 64, 69], 33, [69, 73, 76, 81]),  # A
    ([56, 59, 64, 68], 28, [68, 71, 76, 80]),  # E
    ([57, 61, 66, 69], 30, [69, 73, 78, 81]),  # F#m
    ([57, 62, 66, 69], 26, [69, 74, 78, 81]),  # D
]
COLD = [
    ([57, 60, 64, 69], 33, [69, 72, 76, 81]),  # Am
    ([53, 57, 60, 65], 29, [65, 69, 72, 77]),  # F
    ([55, 60, 64, 67], 36, [67, 72, 76, 79]),  # C
    ([55, 59, 62, 67], 31, [67, 71, 74, 79]),  # G
]


def do_kick(t, g=1.0):
    add(drums, kick(), t, 0.95 * g)
    kick_times.append(t)


def hot_bar(t0, bar_i, full=True, marimba_on=True):
    chord = HOT[bar_i % 4]
    for s in range(16):
        t = t0 + s * S16
        if s % 4 == 0:
            do_kick(t)
        if s % 4 == 2:
            add(drums, hat(0.12, 35), t, 0.32, 0.15)
        add(drums, shaker(), t, 0.10 + (0.08 if s % 2 == 1 else 0), -0.3)
        if full and s in (4, 12):
            add(drums, clap(), t, 0.55, 0.05)
    # tropical bass
    for s, oc in ((0, 0), (3, 12), (6, 0), (8, 0), (11, 12), (14, 0)):
        add(bass, sub(chord[1] + oc + 12, S16 * 1.8), t0 + s * S16, 0.42)
    add(music, pad(chord[0], BAR, cutoff=1800), t0, 0.28)
    if marimba_on:
        arp = chord[2]
        pattern = [(0, 0), (3, 1), (6, 2), (8, 3), (10, 2), (13, 1), (14, 0)]
        for s, k in pattern:
            add(music, marimba(arp[k]), t0 + s * S16, 0.32, [-0.4, 0.4][k % 2])


def cold_bar(t0, bar_i, drums_on=True):
    chord = COLD[bar_i % 4]
    if drums_on:
        do_kick(t0)
        do_kick(t0 + 10 * S16, 0.8)
        add(drums, snare(), t0 + 8 * S16, 0.42)
        add(drums, clap(), t0 + 8 * S16, 0.35)
        for s in range(0, 16, 2):
            add(drums, hat(0.05, 90), t0 + s * S16, 0.12 + (0.06 if s % 4 == 2 else 0), 0.25)
    add(bass, sub(chord[1] + 12, BAR * 0.95), t0, 0.34)
    add(music, pad(chord[0], BAR * 1.05, cutoff=1400, detune=0.18), t0, 0.5)
    arp = chord[2]
    for s, k in ((0, 0), (6, 2), (8, 3), (12, 1)):
        add(music, bell(arp[k] + 12), t0 + s * S16, 0.11, [-0.5, 0.5][k % 2])


def tips_bar(t0, bar_i):
    chord = COLD[bar_i % 4]
    for s in range(16):
        t = t0 + s * S16
        if s % 4 == 0:
            do_kick(t)
        if s % 4 == 2:
            add(drums, hat(0.14, 30), t, 0.32, 0.15)
        else:
            add(drums, hat(0.04, 110), t, 0.1, -0.2)
        if s in (4, 12):
            add(drums, clap(), t, 0.6)
    for s in (2, 6, 10, 14):
        add(bass, sub(chord[1] + 12, S16 * 1.6), t0 + s * S16, 0.5)
    add(music, pad(chord[0], BAR, cutoff=2600), t0, 0.32)
    arp = chord[2]
    for s, k in ((0, 0), (2, 2), (3, 1), (6, 3), (8, 2), (10, 0), (11, 1), (14, 3)):
        add(music, pluck(arp[k]), t0 + s * S16, 0.17, [-0.35, 0.35][s % 2])


# 0 - 18 : PANAS (bar 0..8)
for b in range(9):
    hot_bar(b * BAR, b)
add(fx, impact(), 0.0, 0.85)
# sizzle panas di awal
add(fx, fft_filter(rng.standard_normal(int(3 * SR)), "hp", 6000) * np.exp(-tt(3) * 1.2), 0.0, 0.08)
# whoosh "sore: kok menggigil?" dan "ini penjelasannya"
add(fx, whoosh(0.6), 1.55, 0.5)
add(fx, whoosh(0.5), 3.35, 0.35)
add(fx, whoosh(0.5), 5.7, 0.3)
add(fx, whoosh(0.5), 9.7, 0.3)
add(fx, whoosh(0.5), 13.7, 0.3)
# 18 - 26 : mekanisme (bar 9..12), groove difilter lalu naik
for b in range(4):
    t0 = 18 + b * BAR
    if b < 3:
        hot_bar(t0, b, full=True)
    else:
        hot_bar(t0, b, full=False)
add(fx, whoosh(0.5), 17.7, 0.3)
add(fx, whoosh(0.5), 21.7, 0.3)
# snare roll 24 - 25.75
roll = [24 + i * S16 for i in range(8)] + [25 + i * S16 / 2 for i in range(6)]
for i, t in enumerate(roll):
    add(drums, snare(0.12), t, 0.15 + 0.3 * i / len(roll), 0.1)
add(fx, riser(2.0), 23.75, 0.55)

# 26 - 40 : DINGIN (bar 13..19)
for b in range(7):
    cold_bar(26 + b * BAR, b, drums_on=(b >= 1))
add(fx, impact(3.0), 26.0, 1.0)
add(fx, thunder(6.0, 3), 26.0, 0.75)
add(fx, rain_bed(14.5), 25.9, 0.12)
add(fx, thunder(4.0, 8), 32.9, 0.35)  # alert BMKG
for k, m in enumerate((88, 84, 88, 84)):  # ping peringatan
    add(fx, bell(m, 0.8), 33.0 + k * 0.25, 0.08, 0.2)
add(fx, whoosh(0.5), 29.7, 0.25)
add(fx, riser(2.0), 38.0, 0.45)

# 40 - 52 : TIPS (bar 20..25)
for b in range(6):
    tips_bar(40 + b * BAR, b)
add(fx, impact(1.8), 40.0, 0.55)
for t in (39.7, 42.7, 45.7, 48.7):
    add(fx, whoosh(0.55), t, 0.45)
add(fx, rain_bed(12.0), 40.0, 0.045)

# 52 - 56 : breakdown
for b in range(2):
    cold_bar(52 + b * BAR, b, drums_on=False)
add(fx, riser(2.0), 54.0, 0.55)
add(fx, whoosh(0.5), 51.7, 0.35)

# 56 - 60 : CTA, balik panas (loop ke awal)
for b in range(2):
    hot_bar(56 + b * BAR, b)
add(fx, impact(2.0), 56.0, 0.7)
add(fx, riser(1.0), 59.0, 0.35)

# ----------------------------------------------------------------- mixing
sc = np.ones(N)
curve = 1 - 0.65 * np.exp(-tt(0.4) / 0.09)
for kt in kick_times:
    i = int(kt * SR)
    j = min(N, i + len(curve))
    sc[i:j] = np.minimum(sc[i:j], curve[: j - i])
sc = sc[:, None]

drums_v = drums + reverb(drums, 0.9, 6000, 2) * 0.10
music_v = (music + reverb(music, 2.6, 4500, 5) * 0.35) * sc
bass_v = fft_filter(bass, "lp", 900) * sc
fx_v = fx + reverb(fx, 2.8, 4000, 9) * 0.25

groove = drums_v + bass_v + music_v

# filter sweep 18 -> 26 (lowpass membuka), untuk efek "naik ke awan"
def sweep_fc(t):
    t = np.asarray(t)
    fc = np.full(t.shape, 20000.0)
    m = (t >= 18) & (t < 26)
    p = np.clip((t[m] - 18) / 7.0, 0, 1)
    fc[m] = 450 * (18000 / 450) ** (p**1.6)
    return fc

groove = np.stack([stft_sweep(groove[:, c], sweep_fc) for c in (0, 1)], 1)

# hening dramatis sebelum petir
gate = np.ones(N)
a, b_ = int(25.75 * SR), int(26.0 * SR)
gate[a:b_] = 0
fade = int(0.01 * SR)
gate[a - fade : a] = np.linspace(1, 0, fade)
groove *= gate[:, None]

mix = groove + fx_v
mix = fft_filter(mix, "hp", 28, order=2)
mix /= np.abs(mix).max() + 1e-9
mix = np.tanh(1.6 * mix) / np.tanh(1.6)
# micro fade in/out biar tidak klik
mix[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))[:, None]
mix[-int(0.01 * SR) :] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
mix *= 0.95

out = sys.argv[1] if len(sys.argv) > 1 else "music_raw.wav"
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, mix.shape, "kicks", len(kick_times))
