"""
Rekaman suara user (1 file per episode) -> VO siap pakai + caption + warp animasi.

  /home/user/voicebox/backend/venv/bin/python scripts/user_vo.py <rekaman.m4a> <ep> "<teks CTA di layar>"

Langkah:
 1. Bersihkan: high-pass, noise reduction ringan, normalisasi.
 2. Whisper (lokal, word timestamps) -> cocokkan ke naskah data/scripts/epN.txt per kalimat.
    Kalau satu kalimat direkam ulang (salah baca lalu diulang), yang dipakai take TERAKHIR.
 3. Rakit ulang: hook | isi | CTA dengan jeda rapi -> public/audio/epN_hook.wav, epN_vo.wav, epN_cta.wav.
 4. Waktu kata pakai ejaan naskah (bukan ejaan Whisper) -> data/epN_words.json (format Scribe).
 5. Warp animasi: titik jangkar awal-kalimat (timing lama -> rekaman baru) -> data/epN_warp.json
    (dipakai Episode lewat prop `warp` dan oleh make_audio.py untuk menggeser SFX).
Setelah ini: prep_words.py N, make_audio.py N, lalu render.
"""
import difflib
import json
import re
import subprocess
import sys
import wave

import numpy as np

SR = 48000
src, ep, cta_text = sys.argv[1], int(sys.argv[2]), sys.argv[3]
GAP = {"sent": 0.16, "para": 0.3}  # rapat, gaya ngobrol/ngegosip


def load(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def save(x, path):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


SATU = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"]


def terbilang(n):
    n = int(n)
    if n < 12:
        return SATU[n]
    if n < 20:
        return terbilang(n - 10) + " belas"
    if n < 100:
        return terbilang(n // 10) + " puluh" + ("" if n % 10 == 0 else " " + terbilang(n % 10))
    if n < 200:
        return "seratus" + ("" if n == 100 else " " + terbilang(n - 100))
    if n < 1000:
        return terbilang(n // 100) + " ratus" + ("" if n % 100 == 0 else " " + terbilang(n % 100))
    if n < 2000:
        return "seribu" + ("" if n == 1000 else " " + terbilang(n - 1000))
    if n < 1000000:
        return terbilang(n // 1000) + " ribu" + ("" if n % 1000 == 0 else " " + terbilang(n % 1000))
    return str(n)


def norm(s):
    s = s.lower().replace("-", " ").replace(".", "")
    s = re.sub(r"\d+", lambda m: " " + terbilang(m.group(0)) + " ", s)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z ]", "", s)).strip()

# 1) bersihkan
x = load(src, "highpass=f=80,afftdn=nf=-25,dynaudnorm=f=200:g=11")
x /= np.abs(x).max() + 1e-9
save(x, f"out/ep{ep}_user_clean.wav")

# 2) whisper word timestamps
import os  # noqa: E402

if os.environ.get("REUSE_ASR") and os.path.exists(f"out/ep{ep}_user_asr.json"):
    hyp = json.load(open(f"out/ep{ep}_user_asr.json"))
else:
    from transformers import pipeline  # noqa: E402

    asr = pipeline("automatic-speech-recognition", model="openai/whisper-small", chunk_length_s=30, return_timestamps="word", device="cpu")
    res = asr(f"out/ep{ep}_user_clean.wav", generate_kwargs={"language": "indonesian", "task": "transcribe"})
    hyp = [{"w": c["text"].strip(), "s": c["timestamp"][0], "e": c["timestamp"][1] or c["timestamp"][0] + 0.3} for c in res["chunks"] if c["text"].strip()]
    json.dump(hyp, open(f"out/ep{ep}_user_asr.json", "w"), ensure_ascii=False)

# naskah -> kalimat per bagian
sections, cur = [], None
for line in open(f"data/scripts/ep{ep}.txt", encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    m = re.match(r"^\[(HOOK|MAIN|CTA)\]\s*", line)
    if m:
        cur = {"tag": m.group(1).lower(), "paras": []}
        sections.append(cur)
        line = line[m.end():]
    if line:
        cur["paras"].append([s for s in re.split(r"(?<=[.!?])\s+", line) if s.strip()])

hyp_norm = [norm(h["w"]) for h in hyp]


POS = [0]  # indeks kata ASR setelah kalimat sebelumnya


def locate(sent):
    """cari span kata ASR yang paling mirip kalimat ini, mulai dari posisi kalimat sebelumnya dan hanya di jendela
    dekatnya; kalau ada beberapa (retake), ambil yang terakhir di jendela itu"""
    target = norm(sent).split()
    n = len(target)
    best = []
    lo = POS[0]
    hi = min(len(hyp), lo + 3 * n + 25)
    for i in range(lo, hi):
        for L in (n - 2, n - 1, n, n + 1, n + 2):
            if L <= 0 or i + L > len(hyp):
                continue
            r = difflib.SequenceMatcher(None, " ".join(target), " ".join(hyp_norm[i:i + L])).ratio()
            best.append((r, i, L))
    if not best:
        return None
    top = max(b[0] for b in best)
    good = [b for b in best if b[0] >= (max(0.6, top - 0.08) if top >= 0.6 else top - 0.08)]
    if top >= 0.8:
        r, i, L = max(good, key=lambda b: (b[1], b[0]))  # retake: take terakhir yang cukup mirip
    else:  # kecocokan rendah: jangan loncat jauh, cari di dekat posisi sekarang saja
        near = [b for b in best if b[1] <= lo + 6] or best
        r, i, L = max(near, key=lambda b: (b[0], -b[1]))
    POS[0] = i + L
    return hyp[i]["s"], hyp[i + L - 1]["e"], r


# 3) rakit
out = {"hook": [], "main": [], "cta": []}
words = {"hook": [], "main": [], "cta": []}
anchors = []
low = []
for sec in sections:
    t = 0.0
    for pi, para in enumerate(sec["paras"]):
        for si, sent in enumerate(para):
            loc = locate(sent)
            if loc is None:
                low.append(sent)
                continue
            s, e, r = loc
            if r < 0.7:
                low.append(f"{sent} (cocok {r:.2f})")
            seg = x[int(max(0, s - 0.06) * SR):int((e + 0.12) * SR)].copy()
            f = int(0.008 * SR)
            seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
            dur = len(seg) / SR
            toks = sent.split()
            wts = [len(w) + 1 + (3 if w.endswith(("...", ",", ":")) else 0) for w in toks]
            c = t + 0.06
            for w, wt in zip(toks, wts):
                d = (dur - 0.18) * wt / sum(wts)
                words[sec["tag"]].append({"text": w, "start": round(c, 3), "end": round(c + d * 0.9, 3)})
                c += d
            if sec["tag"] == "main":
                anchors.append((sent, t))
            out[sec["tag"]].append(seg)
            t += dur
            gap = GAP["sent"] if si < len(para) - 1 else GAP["para"]
            out[sec["tag"]].append(np.zeros(int(gap * SR)))
            t += gap

for tag in out:
    save(np.concatenate(out[tag]) if out[tag] else np.zeros(SR), f"public/audio/ep{ep}_{'vo' if tag == 'main' else tag}.wav")

# 4) words + layout + hookcta
json.dump({"words": words["main"]}, open(f"data/ep{ep}_words.json", "w"), ensure_ascii=False, indent=0)
hd = sum(len(a) for a in out["hook"]) / SR
cd = sum(len(a) for a in out["cta"]) / SR
if cd < 0.5:  # CTA tidak direkam: gelembung komen tetap tampil 3 dtk (tanpa suara)
    cd = 3.0
    save(np.zeros(int(cd * SR)), f"public/audio/ep{ep}_cta.wav")
main_end = words["main"][-1]["end"]
HL = json.load(open("data/hl.json")).get(str(ep), [])
intro = round(hd + 0.2, 3)
cta_at = round(main_end + 0.45, 3)
total = round(intro + cta_at + cd + 1.3, 3)
json.dump({"intro": intro, "cta_at": cta_at, "cta_dur": round(cd, 3), "total": total}, open(f"data/ep{ep}_layout.json", "w"))
json.dump({"hookDur": intro, "hookWords": [{"w": w["text"], "start": w["start"], "end": w["end"], "hl": w["text"] in HL} for w in words["hook"]],
           "ctaAt": cta_at, "ctaDur": round(cd, 3), "ctaText": cta_text, "total": total}, open(f"data/ep{ep}_hookcta.json", "w"), ensure_ascii=False)

# 5) warp: awal kalimat di timing lama (data/epN_words_old.json) -> rekaman baru
try:
    old = json.load(open(f"data/ep{ep}_words_old.json"))["words"]
    old = [w for w in old if not re.fullmatch(r"\[.*\]", w["text"])]
    oi, pairs = 0, [[0.0, 0.0]]
    for sent, tn in anchors:
        first = norm(sent.split()[0])
        while oi < len(old) and norm(old[oi]["text"]) != first:
            oi += 1
        if oi < len(old):
            to = old[oi]["start"]
            if to > pairs[-1][0] + 0.05 and tn > pairs[-1][1] + 0.05:
                pairs.append([round(to, 3), round(tn, 3)])
            oi += len(sent.split())
    json.dump(pairs, open(f"data/ep{ep}_warp.json", "w"))
    print(f"warp: {len(pairs)} titik jangkar")
except FileNotFoundError:
    print("tidak ada data/epN_words_old.json -> tanpa warp")

print(f"ep{ep}: hook {hd:.2f}s | isi {main_end:.2f}s | cta {cd:.2f}s | total video {total:.2f}s")
if low:
    print("PERLU DICEK (kalimat tidak ketemu / kurang mirip):")
    for l in low:
        print("  -", l)
