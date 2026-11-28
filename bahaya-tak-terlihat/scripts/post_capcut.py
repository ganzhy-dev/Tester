"""Setelah user_vo.py: perbarui highlight hook (data/hl.json), data/epN_hookcta.json & baris N di src/ep/hookcta2.ts."""
import json, re, sys
ep = int(sys.argv[1])
HOOK_HL = {11: ["seratus", "jam", "seminggu,", "digaji,", "ibu."], 12: ["Lantai", "kamar", "mandi", "basah", "orang", "tua"],
           13: ["tiga", "puluh", "detik", "gas", "bocor"], 14: ["Botol", "air", "mineral", "beneran"],
           15: ["gagang", "panci", "aman", "anak."], 16: ["Enzy", "Storia", "dirawat", "salad."],
           17: ["rajin", "lari,", "persiapan", "simpel"], 18: ["ngecas", "powerbank", "kasur"]}
d = json.load(open("data/hl.json")); d[str(ep)] = HOOK_HL.get(ep, d.get(str(ep), [])); json.dump(d, open("data/hl.json", "w"), ensure_ascii=False)
h = json.load(open(f"data/ep{ep}_hookcta.json"))
for w in h["hookWords"]: w["hl"] = w["w"] in d[str(ep)]
json.dump(h, open(f"data/ep{ep}_hookcta.json", "w"), ensure_ascii=False)
p = "src/ep/hookcta2.ts"; s = open(p).read()
line = f"  {ep}: " + json.dumps(h, ensure_ascii=False) + ","
if re.search(rf"\n  {ep}: \{{", s): s = re.sub(rf"\n  {ep}: \{{.*?\}},\n", "\n" + line + "\n", s, count=1, flags=re.S)
else: s = s.replace("\n};", "\n" + line + "\n};", 1)
open(p, "w").write(s)
print(f"ep{ep}: hook {[w['w'] for w in h['hookWords']]}")
