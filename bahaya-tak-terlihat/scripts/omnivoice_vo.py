"""
VO EP10+ dengan OmniVoice (Voicebox, lokal, CPU) — pengganti ElevenLabs saat kredit habis.

  /home/user/voicebox/backend/venv/bin/python scripts/omnivoice_vo.py <ep> [<ep> ...]

Input : data/scripts/epN.txt  (baris diawali [HOOK]/[MAIN]/[CTA] menandai bagian)
        data/voice/user/user_ref.wav (+ teks referensi) = suara narator = suara user sendiri (atas permintaan user)
Output: out/epN_omni_raw.wav  +  data/epN_omni_words.json  (format mirip Scribe: text/start/end, tag [..] = batas bagian)
Lalu jalankan: process_vo.py out/epN_omni_raw.wav data/epN_omni_words.json N  &&  split_vo.py N "<teks CTA>"

Catatan lisensi: bobot model OmniVoice berlisensi CC-BY-NC (non-komersial).
"""
import json
import re
import sys
import time

sys.path.insert(0, "/home/user/voicebox")
from backend.utils.transformers5_compat import install  # noqa: E402

install()
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from omnivoice import OmniVoice  # noqa: E402

SR = 24000
import os  # noqa: E402

# suara narator: default = suara user sendiri (rekaman 10 dtk, data/voice/user/user_ref.wav)
REF_WAV = os.environ.get("REF_WAV", "data/voice/user/user_ref.wav")
REF_TEXT = os.environ.get(
    "REF_TEXT",
    "Bangun sebelum subuh, masak, nyuci, nganter anak, belanja, beresin rumah, ngurus yang sakit. Terus kalau ditanya kerja apa, jawabnya: cuma ibu rumah tangga.",
)
GAP_SENT, GAP_PARA = 0.22, 0.42

torch.manual_seed(7)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
prompt = m.create_voice_clone_prompt(ref_audio=REF_WAV, ref_text=REF_TEXT)


def trim(w, thr=0.012):
    a = np.abs(w)
    idx = np.where(a > thr * a.max())[0]
    if not len(idx):
        return w
    s, e = max(0, idx[0] - int(0.03 * SR)), min(len(w), idx[-1] + int(0.06 * SR))
    return w[s:e]


# ejaan bantu supaya OmniVoice tidak salah ucap (teks caption tetap pakai ejaan asli)
SAY = {"Simalungun": "Sima lungun", "makhluk": "mahluk", "ELCB": "E L C B", "MCB": "M C B", "ILO": "I L O", "WHO": "W H O", "Rhabdomyolysis": "Rabdomiolisis", "rhabdomyolysis": "rabdomiolisis", "Heat stroke": "Hit strok", "thermal runaway": "termal ranawei", "CPR": "C P R", "FOMO": "fomo", "Enzy": "Enzi", "ke AC": "ke A C", "IGD": "I G D", "watt-jam": "wat jam", "lithium": "litium", "charger": "carjer", "half marathon": "haf maraton", "full marathon": "ful maraton", "American Heart Association": "Amerikan Hart Asosiasyen"}


def say(x):
    for k, v in SAY.items():
        x = x.replace(k, v)
    return x


def sentences(line):
    # pecah per kalimat ("..." di tengah kalimat tetap satu potong); kalimat < 5 kata digabung ke kalimat berikutnya,
    # karena OmniVoice sering melewatkan kalimat yang terlalu pendek
    parts = [p for p in re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", line.strip()) if p.strip()]
    out, buf = [], ""
    for p in parts:
        buf = (buf[:-1] + ", " + p[0].lower() + p[1:]) if buf and buf.endswith(".") else (buf + " " + p if buf else p)
        if len(buf.split()) >= 5:
            out.append(buf.strip())
            buf = ""
    if buf:
        if out and len(buf.split()) < 5:
            out[-1] = out[-1] + " " + buf
        else:
            out.append(buf.strip())
    return out


for ep in [int(a) for a in sys.argv[1:]]:
    lines = [l.strip() for l in open(f"data/scripts/ep{ep}.txt", encoding="utf-8") if l.strip()]
    audio, words, t = [], [], 0.0
    t0 = time.time()
    for li, line in enumerate(lines):
        tag = re.match(r"^\[(HOOK|MAIN|CTA)\]\s*", line)
        if tag:
            words.append({"text": f"[{tag.group(1).lower()}]", "start": round(t, 3), "end": round(t + 0.01, 3)})
            line = line[tag.end():]
        for si, sent in enumerate(sentences(line)):
            for attempt in range(3):
                torch.manual_seed(1000 * ep + 10 * li + si + 97 * attempt)
                out = m.generate(text=say(sent), language="id", num_step=32, voice_clone_prompt=prompt)
                w = out[0] if isinstance(out, (list, tuple)) else out
                w = w.squeeze().cpu().numpy() if hasattr(w, "cpu") else np.asarray(w).squeeze()
                w = trim(w.astype(np.float32))
                dur = len(w) / SR
                if dur >= 0.055 * len(sent):  # terlalu pendek = ada kata yang hilang -> ulang dengan seed lain
                    break
                print(f"  ulang ({attempt + 1}): '{sent[:40]}' cuma {dur:.2f}s", flush=True)
            # waktu kata: proporsional panjang huruf dalam kalimat (ditambah bobot jeda koma/elipsis)
            toks = sent.split()
            wts = [len(x) + 1 + (3 if x.endswith(("...", ",", ":")) else 0) for x in toks]
            tot = sum(wts)
            c = t
            for x, wt in zip(toks, wts):
                d = dur * wt / tot
                words.append({"text": x, "start": round(c, 3), "end": round(c + d * 0.9, 3)})
                c += d
            audio.append(w)
            t += dur
            gap = GAP_SENT
            audio.append(np.zeros(int(gap * SR), np.float32))
            t += gap
        audio.append(np.zeros(int((GAP_PARA - GAP_SENT) * SR), np.float32))
        t += GAP_PARA - GAP_SENT
        print(f"ep{ep} baris {li + 1}/{len(lines)} selesai, {t:.1f}s audio, {time.time() - t0:.0f}s proses", flush=True)
    full = np.concatenate(audio)
    sf.write(f"out/ep{ep}_omni_raw.wav", full, SR)
    json.dump({"words": words}, open(f"data/ep{ep}_omni_words.json", "w"), ensure_ascii=False)
    print(f"ep{ep}: {len(full) / SR:.1f}s -> out/ep{ep}_omni_raw.wav", flush=True)
