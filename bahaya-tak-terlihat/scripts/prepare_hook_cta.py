"""
Siapkan klip HOOK (cold open) dan CTA komen per episode.

  python3 scripts/prepare_hook_cta.py <dir_klip>
Input : <dir>/hookN.mp3, <dir>/ctaN.mp3  (ElevenLabs, suara Adrianleoh)
Output: public/audio/epN_hook.wav, public/audio/epN_cta.wav,
        src/ep/hookcta.ts  (durasi, timing kata hook, teks CTA)
        data/epN_layout.json (dipakai make_audio.py)
"""
import json
import re
import subprocess
import sys
import wave

import numpy as np

SR = 48000
TEMPO = {1: 1.10, 2: 1.06, 3: 1.05, 4: 1.15, 5: 1.15, 6: 1.15}
HOOK_TEXT = {
    1: "Ada yang bikin otak kamu lemot sampai setengahnya tiap rapat... dan kamu nggak sadar.",
    2: "Ada kerusakan di tangan yang nggak bisa balik lagi... dan awalnya cuma kesemutan.",
    3: "Telinga kamu bisa rusak permanen... pelan-pelan, tanpa kamu sadar.",
    4: "Panas siang bisa bikin orang pingsan, bahkan meninggal... dan tandanya sering diabaikan.",
    5: "Debu ini bisa nempel di paru-paru kamu seumur hidup... dan kamu nggak bisa ngeliatnya.",
    6: "Satu kebiasaan di mobil ini udah bikin banyak orang nggak bangun lagi.",
}
HOOK_HL = {"lemot", "setengahnya", "rusak", "permanen...", "balik", "kesemutan.", "pingsan,", "meninggal...", "paru-paru", "seumur", "hidup...", "bangun", "sadar.", "diabaikan.", "ngeliatnya."}
CTA_TEXT = {
    1: "Ruang rapat atau kelas kamu ada jendelanya nggak?",
    2: "Siapa yang pernah kesemutan habis pegang gerinda?",
    3: "Tempat kerja atau sekolahmu seberisik apa?",
    4: "Kamu paling sering kepanasan di mana?",
    5: "Rumah kamu pernah renovasi & debunya ke mana-mana?",
    6: "Tag keluarga/temen yang suka tidur di mobil 🙏",
}
src = sys.argv[1]


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def speech_regions(x, thresh_db=-40, min_gap=0.22):
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.array([np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean()) for i in range(n)])
    on = 20 * np.log10(rms + 1e-9) > thresh_db
    regs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or (j + int(min_gap / 0.01) < n and on[j:j + int(min_gap / 0.01)].any())):
                j += 1
            regs.append((i * hop / SR, j * hop / SR))
            i = j
        else:
            i += 1
    return regs


def process(path, tempo, out):
    x = load(path)
    x /= np.abs(x).max() + 1e-9
    regs = speech_regions(x)
    a, b = max(0, regs[0][0] - 0.04), min(len(x) / SR, regs[-1][1] + 0.08)
    y = x[int(a * SR):int(b * SR)]
    tmp = out + ".tmp.wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"rubberband=tempo={tempo}:transients=crisp", "-ar", str(SR), "-c:a", "pcm_s16le", out], check=True)
    subprocess.run(["rm", "-f", tmp])
    z = load(out)
    return len(z) / SR, [((s - a) / tempo, (e - a) / tempo) for s, e in regs]


def word_times(text, regs):
    """Bagi kata ke region bicara (dipisah '...') secara proporsional panjang huruf."""
    parts = [p.strip() for p in text.split("...") if p.strip()]
    if len(parts) != len(regs):
        parts, regs = [text.replace("...", "")], [(regs[0][0], regs[-1][1])]
    out = []
    for part, (s, e) in zip(parts, regs):
        ws = part.split()
        if part is not parts[-1] and len(parts) > 1:
            ws[-1] += "..."
        tot = sum(len(w) + 1 for w in ws)
        t = s
        for w in ws:
            d = (e - s) * (len(w) + 1) / tot
            out.append({"w": w, "start": round(t, 3), "end": round(t + d * 0.92, 3), "hl": w in HOOK_HL})
            t += d
    return out


ts = ["import type { Word } from \"../Kit\";\n", "export const HOOKCTA: Record<number, { hookDur: number; hookWords: Word[]; ctaAt: number; ctaDur: number; ctaText: string; total: number }> = {"]
for ep in range(1, 7):
    hd, hregs = process(f"{src}/hook{ep}.mp3", TEMPO[ep], f"public/audio/ep{ep}_hook.wav")
    cd, _ = process(f"{src}/cta{ep}.mp3", TEMPO[ep], f"public/audio/ep{ep}_cta.wav")
    words = json.load(open(f"data/ep{ep}_words.json"))["words"]
    main_end = max(w["end"] for w in words)
    intro = round(hd + 0.3, 3)
    cta_at = round(main_end + 0.45, 3)  # relatif ke awal isi utama
    total = round(intro + cta_at + cd + 1.3, 3)
    json.dump({"intro": intro, "cta_at": cta_at, "cta_dur": round(cd, 3), "total": total}, open(f"data/ep{ep}_layout.json", "w"))
    hw = word_times(HOOK_TEXT[ep], hregs)
    ts.append(f"  {ep}: {{ hookDur: {intro}, hookWords: {json.dumps(hw, ensure_ascii=False)}, ctaAt: {cta_at}, ctaDur: {round(cd, 3)}, ctaText: {json.dumps(CTA_TEXT[ep], ensure_ascii=False)}, total: {total} }},")
    print(f"ep{ep}: hook {hd:.2f}s ({len(hregs)} regions) cta {cd:.2f}s | intro {intro} cta_at {cta_at} total {total}")
ts.append("};\n")
open("src/ep/hookcta.ts", "w").write("\n".join(ts))
