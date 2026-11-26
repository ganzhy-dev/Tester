"""
Bikin peta waktu lama -> baru untuk satu episode, dari jangkar (detik lama, kata, ke-berapa).

  python3 scripts/make_warp.py <ep>     (jangkar ada di ANCHORS di bawah)
  -> data/ep<N>_warp.json  dan  src/ep/ep<N>.warp.ts
Juga mencetak endStart & revealAt baru (awal "Follow" dan "jadi" terakhir).
"""
import json
import re
import sys

EP = int(sys.argv[1])

# (detik lama, kata di VO baru, kemunculan ke-n [1-based])
ANCHORS = {
    1: [
        (0.0, None, 0), (3.15, "Jangan-jangan", 1), (6.3, "Tapi", 1), (8.92, "Namanya...", 1), (9.76, "ce", 1),
        (10.72, "Jadi", 1), (13.75, "ditutup,", 1), (14.6, "orangnya", 1), (15.6, "AC-nya", 1),
        (16.95, "nggak", 2), (18.96, "seribu", 1), (20.2, "Padahal", 1), (23.5, "Ada", 1),
        (25.55, "seribu", 2), (27.2, "skor", 1), (29.0, "setengahnya.", 1), (29.95, "Makanya", 1),
        (30.9, "kepala", 1), (31.7, "ngantuk,", 1), (32.38, "nggak", 4), (33.5, "Dan", 1), (34.75, "seger", 1),
        (36.4, "Di", 1), (38.6, "seribu", 3), (39.75, "Jadi", 2), (40.5, "buka", 1), (42.15, "Kasih", 1),
        (43.5, "jangan", 1), (45.45, "Terus", 1), (46.45, "ketiduran", 1), (48.95, "maaf", 1),
        (49.72, "ce", 3), (51.1, "Follow,", 1),
    ],
    2: [
        (0.0, None, 0), (4.0, "Itu", 1), (5.6, "Itu", 2), (8.32, "Getaran!", 1), (9.2, "Jadi", 1),
        (9.84, "bor,", 1), (10.4, "gerinda,", 1), (11.36, "potong,", 1), (12.12, "pelan-pelan", 1),
        (13.04, "saraf", 1), (13.56, "pembuluh", 1), (15.36, "Awalnya", 1), (16.08, "kesemutan,", 1),
        (16.8, "kebas.", 1), (17.68, "Lama-lama", 1), (20.0, "memutih,", 1), (21.36, "dingin.", 1),
        (22.2, "Dan", 1), (24.2, "balik", 1), (25.2, "Eh,", 1), (26.48, "Sopir", 1), (32.16, "satu", 2),
        (33.44, "Terus", 1), (36.32, "Eits...", 1), (37.2, "menurut", 1), (40.4, "Yang", 1), (41.68, "pilih", 1),
        (43.44, "kerjanya", 1), (45.44, "Terus", 2), (47.76, "Jadi", 2), (49.12, "gemeteran", 1),
        (51.52, "Itu", 3), (53.52, "liat", 1), (54.55, "Follow,", 1),
    ],
    3: [
        (0.0, None, 0), (1.2, "Kalau", 1), (2.0, "teriak,", 1), (4.48, "selengan...", 1), (5.44, "telinga", 1),
        (6.32, "dirusak,", 1), (7.92, "Pelakunya,", 1), (9.04, "makhluk", 1), (11.16, "Kebisingan!", 1),
        (12.24, "Di", 1), (13.76, "delapan", 1), (15.92, "delapan", 2), (17.24, "Tapi", 1), (18.28, "tiga", 1),
        (20.48, "setengah.", 1), (21.24, "Jadi", 1), (22.44, "Cuma", 1), (23.84, "Padahal", 1), (24.48, "gerinda", 1),
        (25.92, "sembilan", 1), (28.4, "Dan", 1), (30.04, "permanen.", 1), (31.04, "Tanda", 1), (32.48, "berdenging", 1),
        (34.0, "Eh,", 1), (36.2, "Earphone", 1), (38.16, "seratus", 2), (39.68, "Jadi,", 1), (40.88, "earplug", 1),
        (42.32, "jaga", 1), (44.16, "cek", 1), (45.6, "Dan", 2), (47.2, "santai,", 1), (50.12, "itu", 2),
        (51.52, "Itu", 1), (53.45, "Follow,", 1),
    ],
}


def norm(w):
    return re.sub(r"[^\w\-.,!?]", "", w)


words = [w for w in json.load(open(f"data/ep{EP}_words.json"))["words"] if not re.fullmatch(r"\[.*\]?", w["text"]) and not w["text"].endswith("]")]


def find(word, n):
    k = 0
    for w in words:
        if w["text"] == word:
            k += 1
            if k == n:
                return w["start"]
    raise SystemExit(f"anchor not found: {word} #{n}")


pairs = []
for old, word, n in ANCHORS[EP]:
    new = 0.0 if word is None else find(word, n) - (0.08 if word == "Follow," else 0.02)
    pairs.append([old, round(max(new, 0.0), 3)])
for (a, b), (c, d) in zip(pairs, pairs[1:]):
    assert c > a and d > b, f"non-monotonic anchor near {a}->{c}"
json.dump(pairs, open(f"data/ep{EP}_warp.json", "w"))
with open(f"src/ep/ep{EP}.warp.ts", "w") as f:
    f.write(f"export const warp: [number, number][] = {json.dumps(pairs)};\n")
follow = find("Follow,", 1)
jadi = [w["start"] for w in words if w["text"] == "jadi"][-1]
last = words[-1]["end"]
print(f"ep{EP}: {len(pairs)} anchors | endStart {follow - 0.08:.2f} revealAt {jadi:.2f} | VO ends {last:.2f} -> dur {last + 1.4:.2f}")
