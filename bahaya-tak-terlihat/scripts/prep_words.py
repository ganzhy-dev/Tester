"""ElevenLabs Scribe words.json -> src/ep/epN.words.ts (tanpa tag [..], kata kunci di-highlight)."""
import json, re, sys
HL = {
 1: ["makhluk", "halus", "seribu", "setengahnya.", "Harvard,", "anjlok", "Permenkes", "ngantuk,", "berat,", "fokus.", "seger", "jendela", "jeda.", "kos.", "Gila", "berat", "AC-nya"],
 2: ["Getaran!", "getaran", "getaran,", "putih", "pucat?", "dikerokin.", "saraf", "pembuluh", "kesemutan,", "kebas.", "lemah,", "memutih,", "balik", "satu", "setengah", "kali.", "diandalkan.", "rendah,", "dicicil,", "nonstop.", "hangat", "kering.", "saldo.", "makhluk", "halus", "Eits..."],
 3: ["Kebisingan!", "teriak,", "selengan...", "delapan", "puluh", "lima", "desibel,", "desibel.", "desibel?", "seratus", "belas", "menit,", "setengah.", "permanen.", "berdenging", "earplug", "earmuff,", "nyerah.", "makhluk", "halus", "pendengaran.", "biasa.", "dirusak,"],
}
DISPLAY = {"ce": "CO₂", "o": "", "dua!": "", "duanya": "", "pe": "", "em.": "", "em,": "", "K3": "K3"}
for ep in (1, 2, 3):
    words = json.load(open(f"data/ep{ep}_words.json"))["words"]
    out = []
    for w in words:
        t = w["text"]
        if re.fullmatch(r"\[.*\]", t):
            continue
        out.append({"w": t, "start": round(w["start"], 3), "end": round(w["end"], 3), "hl": t in HL[ep]})
    # gabungkan ejaan "ce o dua" -> CO₂ dan "pe pe em" -> ppm untuk caption
    merged = []
    i = 0
    while i < len(out):
        a = out[i]
        if a["w"].lower() == "ce" and i + 2 < len(out) and out[i + 1]["w"] == "o":
            nxt = out[i + 2]["w"]
            tail = "-nya" if nxt.startswith("duanya") else ("!" if nxt.endswith("!") else "")
            merged.append({"w": "CO₂" + tail, "start": a["start"], "end": out[i + 2]["end"], "hl": True}); i += 3; continue
        if a["w"] == "pe" and i + 2 < len(out) and out[i + 1]["w"] == "pe":
            punct = out[i + 2]["w"][2:]
            merged.append({"w": "ppm" + punct, "start": a["start"], "end": out[i + 2]["end"], "hl": True}); i += 3; continue
        merged.append(a); i += 1
    with open(f"src/ep/ep{ep}.words.ts", "w") as f:
        f.write("import type { Word } from \"../Kit\";\n\nexport const words: Word[] = ")
        f.write(json.dumps(merged, ensure_ascii=False, indent=0))
        f.write(";\n")
    print(ep, len(merged), "words, last end", merged[-1]["end"])
