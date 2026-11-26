"""
Sisipan "KASUS VIRAL" EP7–9 + hook baru EP9, dari satu take ElevenLabs (data/viral_raw.mp3).

  python3 scripts/make_inserts.py

Take dipotong per tag arah suara:
  0 = hook baru EP9 (Justin Bieber)   1 = sisipan EP9 (Sienna Spiro)
  2 = sisipan EP8 (efek ke tim)       3 = sisipan EP7 (Justin Bieber, "tenggelam")
Menulis: public/audio/epN_insert.wav, public/audio/epN_vo.wav (isi + sisipan, dari epN_vo_main.wav),
public/audio/ep9_hook.wav, data/epN_warp.json (untuk SFX), data/epN_layout.json, data/epN_hookcta.json,
src/ep/inserts.ts, src/ep/hookcta2.ts. Aman dijalankan ulang (nilai dasar disimpan di *_hookcta.json).
"""
import glob
import json
import re
import subprocess
import wave

import numpy as np

SR = 48000
TEMPO = 1.15
PAD = 0.12  # jeda sebelum & sesudah klip sisipan

INS = {
    7: dict(seg=3, at=43.40, badge="📰 KASUS VIRAL", title="JUSTIN BIEBER", subtitle="pernah nulis soal mendem perasaan",
            quote="“Rasanya kayak tenggelam…”", note="Yang dipendam nggak hilang ➜ sering pindah ke badan",
            source="Unggahan Instagram Justin Bieber, Maret 2025 (dikutip Fox News & media lain)", accent="#FF5A5F", ghost="stress"),
    8: dict(seg=2, at=23.47, badge="⚠️ EFEK DOMINO", title="EFEKNYA KE SATU TIM", subtitle="yang nanggung bukan cuma satu orang",
            bullets=["🧑‍🤝‍🧑 Temen satu tim yang nambal kerjaannya", "🏥 Dokter burnout: risiko insiden keselamatan pasien ×2"],
            source="Panagioti dkk., JAMA Internal Medicine 2018 · meta-analisis 47 studi, 42.473 dokter", accent="#9D7BFF", ghost="burnout"),
    9: dict(seg=1, at=37.65, badge="📰 KASUS VIRAL", title="SIENNA SPIRO", subtitle="penyanyi yang lagi viral 🎤",
            quote="Lagu pertamanya ditulis umur 10 tahun: tentang dia dibully di sekolah", note="…terus dinyanyiin di depan para pembully-nya 💪",
            source="Wawancara V Magazine & Principle Magazine, 2025", accent="#6C8CFF", ghost="doom"),
}
HOOK9_HL = {"Justin", "Bieber", "jahat", "ribuan", "baik.", "scroll,"}
INS_HL = {"Justin", "Bieber", "tenggelam.", "hilang...", "badan.", "Sienna", "Spiro,", "sepuluh", "dibully", "sekolah.", "ngebully",
          "timnya", "nambal", "burnout,", "dua", "kali", "lipat.", "satu", "orang."}


def load(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def save(x, path):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def fade(x, ms=10):
    f = int(ms / 1000 * SR)
    x = x.copy()
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


# 1) tempo seluruh take (pitch tetap), waktu kata dibagi TEMPO
raw = load("data/viral_raw.mp3")
raw /= np.abs(raw).max() + 1e-9
save(raw, "out/viral_norm.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/viral_norm.wav", "-af", f"rubberband=tempo={TEMPO}:transients=crisp", "-ar", str(SR), "out/viral_fast.wav"], check=True)
fast = load("out/viral_fast.wav")
words = json.load(open("data/viral_words_raw.json"))["words"]
tags = [i for i, w in enumerate(words) if re.fullmatch(r"\[.*\]", w["text"])]
segs = []
for k, i0 in enumerate(tags):
    i1 = tags[k + 1] if k + 1 < len(tags) else len(words)
    ws = [{"w": w["text"], "start": w["start"] / TEMPO, "end": w["end"] / TEMPO} for w in words[i0 + 1:i1]]
    a = max(0, ws[0]["start"] - 0.06)
    b = min(len(fast) / SR, ws[-1]["end"] + 0.12)
    clip = fade(fast[int(a * SR):int(b * SR)])
    segs.append((clip, [{"w": w["w"], "start": round(w["start"] - a, 3), "end": round(w["end"] - a, 3)} for w in ws]))

# 2) hook baru EP9
hc9 = json.load(open("data/ep9_hookcta.json"))
clip, ws = segs[0]
save(clip, "public/audio/ep9_hook.wav")
hc9["hookWords"] = [{**w, "hl": w["w"] in HOOK9_HL} for w in ws]
hc9["hookDur"] = round(len(clip) / SR + 0.3, 3)
json.dump(hc9, open("data/ep9_hookcta.json", "w"), ensure_ascii=False)

# 3) sisipan per episode
ins_ts = []
for ep, d in INS.items():
    clip, ws = segs[d["seg"]]
    save(clip, f"public/audio/ep{ep}_insert.wav")
    dur = round(len(clip) / SR + 2 * PAD, 3)
    main = load(f"public/audio/ep{ep}_vo_main.wav")
    cut = int(d["at"] * SR)
    gap = np.zeros(int(PAD * SR))
    save(np.concatenate([main[:cut], gap, clip, gap, main[cut:]]), f"public/audio/ep{ep}_vo.wav")
    at = d["at"]
    json.dump([[0, 0], [at, at], [at + 0.0001, at + dur], [5000, 5000 + dur]], open(f"data/ep{ep}_warp.json", "w"))
    hc = json.load(open(f"data/ep{ep}_hookcta.json"))
    hc.setdefault("baseCtaAt", hc["ctaAt"])
    hc["ctaAt"] = round(hc["baseCtaAt"] + dur, 3)
    hc["total"] = round(hc["hookDur"] + hc["ctaAt"] + hc["ctaDur"] + 1.3, 3)
    json.dump(hc, open(f"data/ep{ep}_hookcta.json", "w"), ensure_ascii=False)
    json.dump({"intro": hc["hookDur"], "cta_at": hc["ctaAt"], "cta_dur": hc["ctaDur"], "total": hc["total"],
               "insert": {"at": at, "dur": dur}}, open(f"data/ep{ep}_layout.json", "w"))
    iw = [{"w": w["w"], "start": round(w["start"] + PAD, 3), "end": round(w["end"] + PAD, 3), "hl": w["w"] in INS_HL} for w in ws]
    first_note = next((w["start"] for w in iw if w["w"] in ("Yang", "Terus", "Di")), dur * 0.6)
    data = {k: v for k, v in d.items() if k != "seg"}
    data.update(dur=dur, words=iw, times={"quote": 0.9, "note": first_note, "bullets": [iw[0]["start"] + 1.6, first_note]})
    ins_ts.append(f"  {ep}: {json.dumps(data, ensure_ascii=False)},")
    print(f"ep{ep}: sisipan {dur:.2f}s di {at}s | total video {hc['total']:.2f}s")
print(f"ep9: hook baru {hc9['hookDur']:.2f}s")

open("src/ep/inserts.ts", "w").write(
    'import type { InsertData } from "../Insert";\n// dibuat oleh scripts/make_inserts.py\nexport const INSERTS: Record<number, InsertData> = {\n'
    + "\n".join(ins_ts) + "\n};\n")

# total EP9 ikut hook baru
hc9 = json.load(open("data/ep9_hookcta.json"))
hc9["total"] = round(hc9["hookDur"] + hc9["ctaAt"] + hc9["ctaDur"] + 1.3, 3)
json.dump(hc9, open("data/ep9_hookcta.json", "w"), ensure_ascii=False)
L = json.load(open("data/ep9_layout.json"))
L.update(intro=hc9["hookDur"], total=hc9["total"])
json.dump(L, open("data/ep9_layout.json", "w"))

lines = ['import type { Word } from "../Kit";\n', "export const HOOKCTA2: Record<number, { hookDur: number; hookWords: Word[]; ctaAt: number; ctaDur: number; ctaText: string; total: number; baseCtaAt?: number }> = {"]
for p in sorted(glob.glob("data/ep*_hookcta.json")):
    n = int(re.search(r"ep(\d+)_", p).group(1))
    lines.append(f"  {n}: {json.dumps(json.load(open(p)), ensure_ascii=False)},")
lines.append("};\n")
open("src/ep/hookcta2.ts", "w").write("\n".join(lines))
