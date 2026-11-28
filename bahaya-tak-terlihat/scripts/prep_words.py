"""ElevenLabs Scribe words.json -> src/ep/epN.words.ts (tanpa tag [..], kata kunci di-highlight)."""
import json, re, sys
HL = {
 1: ["makhluk", "halus", "seribu", "setengahnya.", "Harvard,", "anjlok", "Permenkes", "ngantuk,", "berat,", "fokus.", "seger", "jendela", "jeda.", "kos.", "Gila", "berat", "AC-nya"],
 2: ["Getaran!", "getaran", "getaran,", "putih", "pucat?", "dikerokin.", "saraf", "pembuluh", "kesemutan,", "kebas.", "lemah,", "memutih,", "balik", "satu", "setengah", "kali.", "diandalkan.", "rendah,", "dicicil,", "nonstop.", "hangat", "kering.", "saldo.", "makhluk", "halus", "Eits..."],
 3: ["Kebisingan!", "teriak,", "selengan...", "delapan", "puluh", "lima", "desibel,", "desibel.", "desibel?", "seratus", "belas", "menit,", "setengah.", "permanen.", "berdenging", "earplug", "earmuff,", "nyerah.", "makhluk", "halus", "pendengaran.", "biasa.", "dirusak,"],
 4: ["angkot,", "upacara", "macet", "sepele,", "neduh", "gorengannya,", "Tekanan", "panas!", "tujuh", "puluh", "persen", "minggu", "pertama.", "makhluk", "halus", "heat", "stroke.", "Darurat.", "empat", "derajat", "segelas", "haus,", "telat.", "teh,", "adaptasi.", "mateng", "bingung,", "pingsan..."],
 5: ["renovasi", "ruang", "tamu...", "anak-anak,", "pintunya,", "Debu", "silika!", "seratus", "kali", "pasir", "silikosis.", "disembuhin.", "Australia", "ngelarang", "respirator.", "air", "N95", "penyedot", "makhluk", "halus", "kaku,", "parut."],
 7: ["perih", "presentasi.", "diiket", "deadline.", "kaku,", "deg-degan,", "normal.", "makhluk", "halus", "Stres!", "macan.", "siaga:", "pergi-pergi.", "Cicilan,", "kerjaan,", "tugas,", "berita...", "tegang", "kepala", "leher", "Usus", "otak,", "psikosomatik.", "pura-pura,", "lebay.", "nyata,", "pikiran.", "asam", "sensitif.", "ditusuk.", "hidung,", "penuh,", "mulut.", "Lima", "menit", "Stanford,", "dokter,", "psikolog.", "lemah.", "sakit."],
 8: ["rebahan,", "tidur...", "bunyi.", "deg-degan,", "notif.", "makhluk", "halus", "kasur...", "Stres", "pulangnya!", "telepressure:", "jelek,", "burnout.", "WHO,", "tiga:", "capek", "sinis", "ada.", "empat", "puluh", "tiga", "persen", "lembur", "stroke", "lima", "meninggal", "jam", "tutup.", "Matiin", "notif", "besok", "pagi,", "atasan", "ketua", "kelas,", "Jadwalin", "manusia...", "customer", "service"],
 9: ["PHK,", "harga", "naik,", "bencana,", "sukses", "scroll,", "scroll.", "pagi.", "Makhluk", "halus", "layar...", "Doomscrolling!", "Boston", "Marathon.", "enam", "jam", "tinggi...", "lokasi", "kejadian.", "bedain", "beneran.", "alarmnya", "tiga", "sekolah", "satu", "dari", "remaja", "dua", "koma", "persen.", "batas:", "dua", "kali", "sebelum", "tidur.", "autoplay.", "Unfollow", "sendirian.", "Kemenkes:", "satu", "sembilan,", "ekstensi", "delapan.", "pilih,", "keras."],
 10: ["Simalungun,", "kesetrum", "kesetrum.", "kawat", "jemuran.", "putus", "seng.", "makhluk", "halus", "listrik", "nyasar!", "tiga", "puluh", "lima", "miliampere", "jantung.", "basah.", "jangan", "langsung", "dipegang.", "MCB", "kayu", "sapu", "kering,", "kering.", "ngelupas.", "sate,", "ELCB,", "milidetik", "nyawa.", "kebanjiran,", "listrik", "salah,", "milih."],
 11: ["subuh.", "ibu", "rumah", "tangga.", "ILO", "seratus", "jam", "empat", "lima", "puluh", "undang-undang.", "tiga", "perempat", "perempuan.", "galon", "ember", "pinggang.", "lutut.", "pulih.", "makhluk", "halus...", "beban", "kelihatan!", "berdua.", "bangku", "tidur", "siang,", "dua", "shift.", "capek.", "dibantu...", "makasih."],
 12: ["kamar", "mandi.", "licin...", "kepeleset.", "memar.", "patah", "tulang", "panggul.", "makhluk", "halus", "basah...", "Lantai", "licin!", "WHO", "nomor", "dua", "enam", "ratus", "delapan", "puluh", "empat", "ribu", "enam", "puluh", "dicegah.", "anti-slip.", "pegangan", "lampu", "sandal", "karet", "pusing", "ratusan", "ribu.", "sendiri.", "giliran", "kita."],
 13: ["Pertamina,", "regulator", "Gas", "bocor!", "berat", "lantai.", "saklar", "jendela", "regulatornya", "terbuka.", "ber-SNI.", "sabun.", "gelembung,", "diganti.", "selang", "tahun,", "kompor.", "keren."],
 14: ["disinfektan", "IDAI", "aki", "minyak", "tanah.", "Botol", "nyaru!", "label", "bening", "aslinya.", "tinggi,", "dikunci.", "muntah,", "IGD,", "botolnya,", "jaga", "bareng,", "air."],
 15: ["mainan.", "Ponorogo,", "Air", "panas!", "tipis", "WHO", "dicegah.", "dalam.", "tinggi.", "sejuk,", "menit.", "es,", "Odol,", "mentega,", "kecap", "nempel.", "bersih.", "dokter,", "telapak"],
 16: ["menduga", "mentah,", "amuba,", "Salad", "Licik!", "kebersihan.", "kotoran", "WHO", "lima", "kunci", "sabun,", "detik.", "mengalir,", "digosok.", "Talenan", "dipisah.", "jam", "matang.", "faskes"],
 17: ["Borobudur", "Marathon", "Keren!", "Garis", "Finis!", "sabar.", "jarang.", "CPR", "melipattigakan", "bertahap.", "FOMO.", "jantung", "haus.", "elektrolit.", "Berhenti", "cokelat", "IGD.", "demam?", "nyampe."],
 18: ["berasap", "kasur.", "Bantal", "Bara!", "meja.", "thermal", "runaway.", "watt-jam,", "kabin,", "maskapai.", "keras,", "cabut.", "semalaman.", "bersertifikat,", "menggembung,", "pensiunin.", "Damkar", "tenang."],
 6: ["mati", "lampu,", "garasi.", "bengkel", "gudang", "Karbon", "monoksida!", "berwarna,", "berbau.", "dua", "ratus", "oksigen.", "masuk", "angin:", "genset,", "enam", "meter", "detektor", "makhluk", "halus", "licik...", "nasib.", "bangun", "keracunan"],
}
DISPLAY = {"ce": "CO₂", "o": "", "dua!": "", "duanya": "", "pe": "", "em.": "", "em,": "", "K3": "K3"}
import os
for ep in [e for e in (int(a) for a in sys.argv[1:]) if os.path.exists(f"data/ep{e}_words.json")]:
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
        if a["w"].lower() == "ce" and i + 1 < len(out) and out[i + 1]["w"].startswith("o"):
            o = out[i + 1]["w"]
            nxt = out[i + 2]["w"] if i + 2 < len(out) else ""
            if o == "o" and nxt.lower().startswith("dua"):
                tail = nxt[3:]  # "nya", "!", ".", ""
                tail = "-nya" if tail.startswith("nya") else tail
                merged.append({"w": "CO₂" + tail, "start": a["start"], "end": out[i + 2]["end"], "hl": True}); i += 3; continue
            merged.append({"w": "CO" + o[1:], "start": a["start"], "end": out[i + 1]["end"], "hl": True}); i += 2; continue
        if a["w"] == "pe" and i + 2 < len(out) and out[i + 1]["w"] == "pe":
            punct = out[i + 2]["w"][2:]
            merged.append({"w": "ppm" + punct, "start": a["start"], "end": out[i + 2]["end"], "hl": True}); i += 3; continue
        merged.append(a); i += 1
    with open(f"src/ep/ep{ep}.words.ts", "w") as f:
        f.write("import type { Word } from \"../Kit\";\n\nexport const words: Word[] = ")
        f.write(json.dumps(merged, ensure_ascii=False, indent=0))
        f.write(";\n")
    print(ep, len(merged), "words, last end", merged[-1]["end"])
