"""
Audio final per episode: musik orisinal (disintesis, bebas copyright) + SFX + voice-over ElevenLabs,
dengan ducking otomatis (musik turun saat narator bicara) dan loudness -13 LUFS.

  python3 scripts/make_audio.py 1      -> public/audio/ep1_mix.wav

Isyarat SFX dibaca dari data/epN_sfx.json: [{"t": detik, "type": "pop", "gain": 1.0}, ...]
Tipe: pop whoosh scan boing ding buzz thud sparkle riser tick snore vibrate blast ring stop
("stop" membisukan musik dari t selama "dur" detik — buat jeda dramatis)
"""
import json
import subprocess
import sys
import wave

import numpy as np

SR = 48000
EP = int(sys.argv[1])
CFG = {
    1: dict(bpm=104, chords=[(53, [65, 69, 72]), (50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67])]),  # F Dm Bb C
    2: dict(bpm=108, chords=[(43, [67, 71, 74]), (40, [64, 67, 71]), (48, [64, 67, 72]), (50, [66, 69, 74])]),  # G Em C D
    3: dict(bpm=106, chords=[(50, [62, 66, 69]), (47, [62, 66, 71]), (43, [62, 67, 71]), (45, [61, 64, 69])]),  # D Bm G A
}[EP]
rng = np.random.default_rng(100 + EP)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.003, r=0.02):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def filt(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x)
    f = np.maximum(np.fft.rfftfreq(len(x), 1 / SR), 1e-3)
    H = np.ones_like(f)
    if lo:
        H *= 1 / np.sqrt(1 + (lo / f) ** (2 * order))
    if hi:
        H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * H, n=len(x))


def sweep_tone(f0, f1, d, shape=np.sin):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    return shape(2 * np.pi * np.cumsum(f) / SR)


# Rantai mastering vokal: buang rumble, rapikan mud, presence + air, kompresi halus, de-esser
VOICE_CHAIN = ("highpass=f=85,equalizer=f=220:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=3,"
               "equalizer=f=9500:t=q:w=1.0:g=2,acompressor=threshold=-20dB:ratio=3:attack=4:release=90:makeup=3,"
               "deesser=i=0.35:m=0.5:f=0.5")


def read_audio(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


# ------------------------------------------------------------ instrumen
def kick():
    t = tt(0.3)
    f = 50 + 90 * np.exp(-t * 30)
    return np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11))


def snap():
    t = tt(0.15)
    return filt(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 45) * 1.3


def shaker():
    t = tt(0.07)
    return filt(rng.standard_normal(len(t)), 5000, 13000) * np.minimum(t / 0.01, 1) * np.exp(-t * 60)


def pizz(m, d=0.35):
    t = tt(d)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) * np.exp(-t * 18) + 0.2 * np.sin(6 * np.pi * f * t) * np.exp(-t * 30)
    return s * np.exp(-t * 11) * env(len(t))


def bass(m, d=0.3):
    t = tt(d)
    f = mtof(m)
    return np.tanh(1.3 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t))) * np.exp(-t * 5) * env(len(t), 0.004, 0.04)


def glock(m, d=1.2):
    t = tt(d)
    f = mtof(m)
    return np.sin(2 * np.pi * f * t + 1.2 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.01 * t)) * np.exp(-t * 3.5) * env(len(t))


# ------------------------------------------------------------------ SFX
def sfx(kind, dur=None):
    if kind == "pop":
        t = tt(0.12)
        return sweep_tone(900, 280, 0.12) * np.exp(-t * 30) * 0.9
    if kind == "whoosh":
        d = 0.4
        n = rng.standard_normal(int(d * SR))
        out = np.zeros_like(n)
        seg = len(n) // 8
        for i in range(8):
            c = 500 * (4500 / 500) ** (i / 7)
            out[i * seg:(i + 1) * seg] = filt(n, c * 0.6, c * 1.6)[i * seg:(i + 1) * seg]
        return out * np.sin(np.pi * tt(d)[: len(out)] / d) ** 2 * 1.4
    if kind == "scan":
        d = 0.9
        t = tt(d)
        tone = sweep_tone(350, 2600, d) * 0.5 + sweep_tone(700, 5200, d) * 0.18
        shim = filt(rng.standard_normal(len(t)), 4000, 12000) * 0.25
        return (tone + shim) * np.sin(np.pi * t / d) ** 0.6 * env(len(t))
    if kind == "boing":
        d = 0.55
        t = tt(d)
        f = 180 + 120 * np.exp(-t * 4) * (1 + 0.5 * np.sin(2 * np.pi * 14 * t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * env(len(t))
    if kind == "ding":
        return (glock(88, 1.3) * 0.6 + glock(95, 1.3) * 0.3)
    if kind == "buzz":
        t = tt(0.4)
        return np.sign(np.sin(2 * np.pi * 110 * t)) * 0.25 * filt(np.ones(len(t)), None, None) * env(len(t), 0.005, 0.05)
    if kind == "thud":
        t = tt(0.4)
        return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 25)) / SR) * np.exp(-t * 9))
    if kind == "sparkle":
        out = np.zeros(int(0.8 * SR))
        for i in range(6):
            g = glock(96 + rng.integers(0, 8), 0.5) * 0.35
            p = int(i * 0.09 * SR)
            out[p:p + len(g)] += g[: len(out) - p]
        return out
    if kind == "riser":
        d = dur or 1.0
        t = tt(d)
        return (sweep_tone(200, 1400, d) * 0.4 + filt(rng.standard_normal(len(t)), 2000, 9000) * 0.3) * (t / d) ** 2
    if kind == "tick":
        t = tt(0.03)
        return filt(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 200)
    if kind == "snore":
        d = 1.3
        t = tt(d)
        lfo = np.clip(np.sin(np.pi * t / 0.65), 0, 1) ** 2
        return filt(rng.standard_normal(len(t)), 120, 900) * lfo * 0.9 + np.sin(2 * np.pi * 70 * t) * lfo * 0.3
    if kind == "vibrate":
        d = dur or 1.2
        t = tt(d)
        s = np.sign(np.sin(2 * np.pi * 55 * t)) * 0.35 + np.sin(2 * np.pi * 110 * t) * 0.3
        return filt(s, 40, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * env(len(t), 0.02, 0.1)
    if kind == "blast":
        d = dur or 0.9
        t = tt(d)
        return np.tanh(3 * filt(rng.standard_normal(len(t)), 300, 6000)) * 0.5 * env(len(t), 0.005, 0.2)
    if kind == "ring":
        d = dur or 2.0
        t = tt(d)
        return np.sin(2 * np.pi * 4000 * t) * 0.18 * env(len(t), 0.2, 0.6)
    raise ValueError(kind)


# ------------------------------------------------------------------ main
import os
_vo = f"public/audio/ep{EP}_vo.wav" if os.path.exists(f"public/audio/ep{EP}_vo.wav") else f"public/audio/ep{EP}_vo.mp3"
vo = read_audio(_vo, VOICE_CHAIN)
cues = json.load(open(f"data/ep{EP}_sfx.json"))
# Peta waktu lama -> baru (sama dengan warp di Episode.tsx), kalau ada
try:
    WARP = json.load(open(f"data/ep{EP}_warp.json"))
except FileNotFoundError:
    WARP = None


def warp(x):
    for (oA, nA), (oB, nB) in zip(WARP, WARP[1:]):
        if oA <= x <= oB:
            return nA + (x - oA) * (nB - nA) / (oB - oA)
    return x - WARP[-1][0] + WARP[-1][1]


if WARP:
    for c in cues:
        if not c.get("abs"):
            c["t"] = warp(c["t"])
DUR = len(vo) / SR + 1.4
N = int(DUR * SR)
music = np.zeros(N)
fx = np.zeros(N)


def add(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig * g


beat = 60 / CFG["bpm"]
s16 = beat / 4
bar = 4 * beat
nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar
    root, tri = CFG["chords"][b % 4]
    for s in range(16):
        t = t0 + s * s16
        if s in (0, 8):
            add(music, kick(), t, 0.55)
        if s in (4, 12):
            add(music, snap(), t, 0.35)
        add(music, shaker(), t, 0.05 + (0.04 if s % 2 else 0))
    for s, oc in ((0, 0), (3, 0), (6, 12), (8, 0), (11, 7), (14, 12)):
        add(music, bass(root + oc - 12 if oc != 7 else root + 7 - 12), t0 + s * s16, 0.5)
    for k, s in enumerate((2, 6, 10, 14)):
        add(music, pizz(tri[k % 3] + 12), t0 + s * s16, 0.25)
    if b % 2 == 1:
        for k, s in enumerate((0, 3, 6)):
            add(music, glock(tri[(k + 1) % 3] + 24), t0 + s * s16, 0.06)

stop = np.ones(N)
for c in cues:
    if c["type"] == "stop":
        a, b2 = int(c["t"] * SR), int((c["t"] + c.get("dur", 0.5)) * SR)
        stop[a:b2] = 0
    else:
        add(fx, sfx(c["type"], c.get("dur")), c["t"], c.get("gain", 1.0))
# halus-kan gerbang stop
k = np.ones(int(0.01 * SR)) / int(0.01 * SR)
stop = np.convolve(stop, k, mode="same")
music *= stop
# akhir: musik fade
fo = int(1.0 * SR)
music[-fo:] *= np.linspace(1, 0, fo)

# ducking dari envelope VO
vpad = np.zeros(N)
vpad[: len(vo)] = vo
e = np.abs(vpad)
win = int(0.03 * SR)
e = np.convolve(e, np.ones(win) / win, mode="same")
e = e / (e.max() + 1e-9)
g = np.zeros(N)
att, rel = np.exp(-1 / (0.01 * SR)), np.exp(-1 / (0.3 * SR))
prev = 0.0
target = np.clip(e * 6, 0, 1)
for i in range(0, N, 64):
    tv = target[i]
    c = att if tv > prev else rel
    prev = c ** 64 * prev + (1 - c ** 64) * tv
    g[i:i + 64] = prev
duck = 1 - 0.82 * g

vpad = vpad / (np.abs(vpad).max() + 1e-9) * 0.9
music = music / (np.abs(music).max() + 1e-9) * 0.42
mix = vpad + music * duck + fx * 0.32
mix = filt(mix, 30, None)
mix = np.tanh(1.2 * mix) / np.tanh(1.2)

tmp = f"out/ep{EP}_mix_raw.wav"
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
stereo = np.stack([pcm, pcm], 1)
with wave.open(tmp, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
# loudnorm dua tahap (linear, tanpa efek "memompa")
m1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-13:TP=-1.2:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m1[m1.rindex("{"): m1.rindex("}") + 1])
af = (f"loudnorm=I=-13:TP=-1.2:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
      f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), f"public/audio/ep{EP}_mix.wav"], check=True)
print(f"ep{EP}: {DUR:.2f}s -> public/audio/ep{EP}_mix.wav")
