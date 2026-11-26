"""
EP7+: satu take ElevenLabs berisi HOOK + isi + CTA. Jalankan setelah process_vo.py:
  python3 scripts/split_vo.py <ep> "<teks CTA di layar>"
Memotong public/audio/epN_vo.wav (hasil process_vo) jadi epN_hook.wav, epN_vo.wav (isi), epN_cta.wav,
menulis data/epN_words.json (isi saja, waktu relatif), data/epN_layout.json, dan src/ep/hookcta2.ts.
Batas potong = tag arah suara: tag ke-2 = awal isi, tag terakhir = awal CTA.
"""
import json
import re
import subprocess
import sys
import wave

import numpy as np

SR = 48000
ep, cta_text = int(sys.argv[1]), sys.argv[2]
words = json.load(open(f"data/ep{ep}_words.json"))["words"]
tags = [i for i, w in enumerate(words) if re.fullmatch(r"\[.*\]", w["text"])]
i_main, i_cta = tags[1], tags[-1]
spoken = lambda ws: [w for w in ws if not re.fullmatch(r"\[.*\]", w["text"])]
hook_w = spoken(words[:i_main])
main_w = spoken(words[i_main:i_cta])
cta_w = spoken(words[i_cta:])

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"public/audio/ep{ep}_vo.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)


def cut(a, b, path):
    seg = x[max(0, int(a * SR)):min(len(x), int(b * SR))].copy()
    f = int(0.01 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f:] *= np.linspace(1, 0, f)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes())
    return len(seg) / SR


# titik potong di tengah jeda antar bagian
h_end = (hook_w[-1]["end"] + main_w[0]["start"]) / 2
m_start = h_end
m_end = (main_w[-1]["end"] + cta_w[0]["start"]) / 2
hd = cut(0, h_end, f"public/audio/ep{ep}_hook.wav")
md = cut(m_start, m_end, f"public/audio/ep{ep}_vo.wav")
cd = cut(m_end, len(x) / SR, f"public/audio/ep{ep}_cta.wav")

HL = json.load(open("data/hl.json")).get(str(ep), [])
shift = lambda ws, o: [{"text": w["text"], "start": round(w["start"] - o, 3), "end": round(w["end"] - o, 3)} for w in ws]
json.dump({"words": shift(main_w, m_start)}, open(f"data/ep{ep}_words.json", "w"), ensure_ascii=False, indent=0)
hook_words = [{"w": w["text"], "start": w["start"], "end": w["end"], "hl": w["text"] in HL} for w in shift(hook_w, 0)]
main_end = main_w[-1]["end"] - m_start
intro = round(hd + 0.3, 3)
cta_at = round(main_end + 0.45, 3)
total = round(intro + cta_at + cd + 1.3, 3)
json.dump({"intro": intro, "cta_at": cta_at, "cta_dur": round(cd, 3), "total": total}, open(f"data/ep{ep}_layout.json", "w"))
json.dump({"hookDur": intro, "hookWords": hook_words, "ctaAt": cta_at, "ctaDur": round(cd, 3), "ctaText": cta_text, "total": total},
          open(f"data/ep{ep}_hookcta.json", "w"), ensure_ascii=False)

# hookcta2.ts dari semua data/epN_hookcta.json (EP7+)
import glob, os
lines = ['import type { Word } from "../Kit";\n', "export const HOOKCTA2: Record<number, { hookDur: number; hookWords: Word[]; ctaAt: number; ctaDur: number; ctaText: string; total: number }> = {"]
for p in sorted(glob.glob("data/ep*_hookcta.json")):
    n = int(re.search(r"ep(\d+)_", p).group(1))
    lines.append(f"  {n}: {json.dumps(json.load(open(p)), ensure_ascii=False)},")
lines.append("};\n")
open("src/ep/hookcta2.ts", "w").write("\n".join(lines))
print(f"ep{ep}: hook {hd:.2f}s | isi {md:.2f}s (akhir kata {main_end:.2f}) | cta {cd:.2f}s | total video {total:.2f}s")
