"""
Rapikan voice-over ElevenLabs untuk TikTok:
  1. jeda hening panjang (> MAX_PAUSE) dirapatkan jadi KEEP detik (gaya jump-cut)
  2. tempo dinaikkan TEMPO x dengan rubberband (pitch tetap)
  3. timestamp kata Scribe dipetakan ulang secara deterministik

  python3 scripts/process_vo.py <raw.mp3> <scribe_words.json> <ep>
  -> public/audio/ep<N>_vo.wav  +  data/ep<N>_words.json
"""
import json
import subprocess
import sys

import numpy as np

SR = 48000
THRESH_DB = -42
# Per episode: (tempo, jeda maksimum, jeda yang disisakan). Target: video > 60 dtk (syarat Creator Rewards).
SETTINGS = {1: (1.10, 0.30, 0.24), 2: (1.06, 0.30, 0.24), 3: (1.00, 0.55, 0.40), 4: (1.15, 0.30, 0.24), 5: (1.15, 0.30, 0.24), 6: (1.15, 0.30, 0.24), 7: (1.15, 0.30, 0.24), 8: (1.15, 0.30, 0.24), 9: (1.15, 0.30, 0.24), 10: (1.0, 0.50, 0.42), 11: (1.0, 0.50, 0.42), 12: (0.95, 0.55, 0.45)}

raw, words_path, ep = sys.argv[1], sys.argv[2], int(sys.argv[3])
TEMPO, MAX_PAUSE, KEEP = SETTINGS[ep]
x = np.frombuffer(
    subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout,
    np.float32,
).astype(np.float64)
x /= np.abs(x).max() + 1e-9

hop = int(0.01 * SR)
nfr = len(x) // hop
rms = np.array([np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean()) for i in range(nfr)])
silent = 20 * np.log10(rms + 1e-9) < THRESH_DB

# cari run hening
runs = []
i = 0
while i < nfr:
    if silent[i]:
        j = i
        while j < nfr and silent[j]:
            j += 1
        runs.append((i * hop / SR, j * hop / SR))
        i = j
    else:
        i += 1

# segmen yang dipertahankan: (src_start, src_end)
keep = []
cursor = 0.0
dur = len(x) / SR
for a, b in runs:
    if a <= 0.001:  # hening di awal
        cursor = max(cursor, b - 0.05)
        continue
    if b >= dur - 0.001:  # hening di akhir
        keep.append((cursor, min(dur, a + 0.35)))
        cursor = None
        break
    if b - a > MAX_PAUSE:
        keep.append((cursor, a + KEEP / 2))
        cursor = b - KEEP / 2
if cursor is not None:
    keep.append((cursor, dur))

# rakit dengan crossfade 8 ms
fade = int(0.008 * SR)
out = []
mapping = []  # (src_a, src_b, dst_a)
pos = 0.0
for a, b in keep:
    seg = x[int(a * SR):int(b * SR)].copy()
    if len(seg) > 2 * fade:
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
    mapping.append((a, b, pos))
    out.append(seg)
    pos += len(seg) / SR
y = np.concatenate(out)


def tmap(t):
    for a, b, d in mapping:
        if t < a:
            return d / TEMPO
        if t <= b:
            return (d + (t - a)) / TEMPO
    a, b, d = mapping[-1]
    return (d + (b - a)) / TEMPO


tmp = f"out/ep{ep}_vo_trim.wav"
pcm = (np.clip(y, -1, 1) * 32767).astype(np.int16)
import wave

with wave.open(tmp, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"rubberband=tempo={TEMPO}:transients=crisp:detector=compound:window=standard",
     "-ar", str(SR), "-c:a", "pcm_s16le", f"public/audio/ep{ep}_vo.wav"],
    check=True,
)

words = json.load(open(words_path))["words"]
mapped = [{**w, "start": round(tmap(w["start"]), 3), "end": round(tmap(w["end"]), 3)} for w in words]
json.dump({"words": mapped}, open(f"data/ep{ep}_words.json", "w"), ensure_ascii=False, indent=0)
print(f"ep{ep}: raw {dur:.2f}s -> trimmed {pos:.2f}s -> final {pos / TEMPO:.2f}s, last word ends {mapped[-1]['end']:.2f}s")
