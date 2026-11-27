"""
Warp animasi ke VO baru: titik jangkar = awal tiap kalimat (timing lama -> timing baru).

  python3 scripts/words_warp.py <ep>

Lama: data/epN_words_old.json (timing yang dipakai saat adegan dibuat)
Baru: data/epN_words.json      (VO baru, hasil process_vo + split_vo)
Output: data/epN_warp.json (dipakai make_audio.py untuk SFX) + src/ep/epN.warp.ts (dipakai EpN.tsx)
"""
import difflib
import json
import re
import sys

ep = int(sys.argv[1])
clean = lambda ws: [w for w in ws if not re.fullmatch(r"\[.*\]", w["text"])]
key = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
old = clean(json.load(open(f"data/ep{ep}_words_old.json"))["words"])
new = clean(json.load(open(f"data/ep{ep}_words.json"))["words"])

sm = difflib.SequenceMatcher(None, [key(w["text"]) for w in old], [key(w["text"]) for w in new], autojunk=False)
pairs = [[0.0, 0.0]]
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        i, j = a + k, b + k
        starts_sentence = i == 0 or old[i - 1]["text"][-1:] in ".!?:" or old[i - 1]["text"].endswith("...")
        if starts_sentence:
            to, tn = round(old[i]["start"], 3), round(new[j]["start"], 3)
            if to > pairs[-1][0] + 0.05 and tn > pairs[-1][1] + 0.05:
                pairs.append([to, tn])
# titik akhir: kata terakhir
to, tn = round(old[-1]["end"], 3), round(new[-1]["end"], 3)
if to > pairs[-1][0] + 0.05 and tn > pairs[-1][1] + 0.05:
    pairs.append([to, tn])

json.dump(pairs, open(f"data/ep{ep}_warp.json", "w"))
open(f"src/ep/ep{ep}.warp.ts", "w").write(
    "/** Titik jangkar [detik lama, detik baru] — dibuat scripts/words_warp.py */\n"
    f"export const warp: [number, number][] = {json.dumps(pairs)};\n"
)
print(f"ep{ep}: {len(pairs)} titik jangkar, lama {old[-1]['end']:.2f}s -> baru {new[-1]['end']:.2f}s")
