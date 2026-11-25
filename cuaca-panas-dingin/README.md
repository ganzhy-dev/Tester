# Siang Panas, Sore Menggigil — Motion Video TikTok

Video motion graphic vertikal berdurasi 60 detik tentang cuaca Indonesia akhir November 2026 yang siangnya panas lalu sorenya hujan dan dingin.

- **Format:** 2160×3840 (4K vertikal 9:16), 60 fps, H.264 + AAC 320 kbps
- **Musik:** orisinal, 120 BPM, disintesis dengan kode (`scripts/make_music.py`). Tidak memakai sampel, jadi aman dari klaim copyright.
- **Dibuat dengan:** [Remotion](https://remotion.dev) (React → video), mengikuti skill resmi `remotion-dev/skills` yang ditemukan lewat `npx skills`

## Script (detik demi detik)

Semua teks muncul di layar, dan potongan adegannya jatuh pas di ketukan musik (1 ketukan = 0,5 dtk).

| Waktu | Di layar | Visual / audio |
|---|---|---|
| 0–1,8 | **SIANG INI 35°C**, rasanya kayak *dipanggang* | Matahari berdenyut, angka naik 29→35, impact |
| 1,8–3,6 | **SORENYA 25°C**, kok malah *menggigil?* | Kilat kecil, langit langsung biru gelap, hujan, teks gemetar |
| 3,6–6 | Bukan perasaan kamu doang. Cuaca lagi *labil parah.* | Balik panas |
| 6–10 | Akhir November harusnya udah *musim hujan* kan? | Kalender NOV 25 |
| 10–14 | Faktanya, baru **18%** zona musim di Indonesia yang *udah masuk* musim hujan. | Cincin progres 0→18% (BMKG, per 23 Nov) |
| 14–18 | Biang keroknya: *El Niño* lagi kuat. | Bar SEP–DES, blok "musim hujan" bergeser mundur 20–30 hari |
| 18–22 | Terus kok sorenya bisa hujan *deres?* → Jawabannya justru si *panas siang* itu. | Groove difilter, makin lama makin terbuka |
| 22–25,75 | Udara panas & lembap naik, numpuk jadi *awan hujan.* | Diagram konveksi: kota, panah naik, awan kumulonimbus tumbuh |
| 25,75–26 | dan… | Layar hitam, musik hening |
| 26–28 | **DUARR!** Sorenya *berubah total.* | Petir, flash, guncangan kamera, hujan turun |
| 28–33 | Hujan deres, angin dingin. Suhu bisa *anjlok* cuma dalam beberapa jam. | Termometer 35°→25° |
| 33–40 | ⚠ PERINGATAN BMKG: **SIAGA** hujan lebat di **12 provinsi** (24–26 Nov). Daerahmu *termasuk?* | Kartu peringatan + chip Aceh, Sumbar, Jabar, Kalbar, +8 lainnya |
| 40–52 | Biar nggak tumbang: 01 bawa payung + jaket tipis · 02 minum terus · 03 jangan neduh di bawah pohon/baliho · 04 cek InfoBMKG | Kartu tips masuk dengan whoosh |
| 52–56 | Intinya, siang panas sore hujan itu *wajar* pas peralihan musim. Yang penting, *kamu siap.* | Matahari mulai muncul lagi |
| 56–60 | Di tempatmu sekarang? 🥵 PANAS / 🌧️ HUJAN — Jawab di komen ↓ | Layar terbelah panas dan hujan, lalu loop mulus ke detik 0 |

### Voice-over (opsional, kalau mau rekam suara sendiri)

> Siang 35 derajat, rasanya kayak dipanggang. Eh, sorenya malah menggigil.
> Bukan perasaan kamu doang, cuaca emang lagi labil parah.
> Akhir November harusnya udah musim hujan, kan? Faktanya, baru sekitar 18 persen zona musim yang beneran masuk musim hujan. Biang keroknya El Niño yang lagi kuat, jadi musim hujan mundur 20 sampai 30 hari.
> Terus kok sorenya bisa hujan deres? Justru gara-gara panas siang itu. Udara panas dan lembap naik, numpuk jadi awan hujan, dan… duarr!
> Hujan deres, angin dingin, suhu bisa anjlok cuma dalam beberapa jam. Minggu ini BMKG bahkan pasang status Siaga hujan lebat di 12 provinsi.
> Jadi: bawa payung plus jaket tipis, minum terus, jangan neduh di bawah pohon atau baliho pas angin kencang, dan cek InfoBMKG sebelum berangkat.
> Di tempatmu sekarang panas atau hujan? Tulis di komen.

### Caption dan hashtag TikTok

```
Siang kayak dipanggang, sore langsung menggigil 🥶 ternyata ini penyebabnya

Di tempatmu sekarang panas atau hujan? 👇

#cuaca #bmkg #musimhujan #elnino #cuacahariini #infocuaca #hujan #panas #fyp #fypindonesia
```

Tips upload:
- Upload file 4K-nya langsung lewat aplikasi atau TikTok Studio. Jangan diedit lagi di CapCut, biar kualitasnya gak turun dua kali.
- Pilih frame detik 0,5 ("35°C") atau 26,3 ("DUARR!") sebagai cover.
- Videonya sengaja dibuat loop: detik 60 nyambung mulus ke detik 0, jadi penonton cenderung nonton ulang.
- Elemen penting sudah ditaruh di luar area UI TikTok (kolom tombol kanan dan caption di bawah).

## Sumber riset

- Kompas TV — Prakiraan cuaca BMKG 24–30 November 2026 (Siaga hujan lebat di 12 provinsi): https://www.kompas.tv/info-publik/703451/prakiraan-cuaca-bmkg-24-30-november-2026-waspada-hujan-lebat-disertai-petir-dan-angin-kencang
- Topik.id — 127 zona musim (18,2%) sudah masuk musim hujan per 23 Nov 2026; El Niño kuat: https://topik.id/kapan-musim-hujan-2026-dimulai-ini-prediksi-bmkg-dan-jadwal-puncaknya
- Tirto — BMKG: musim hujan mundur akibat El Niño: https://tirto.id/bmkg-musim-hujan-diprediksi-mundur-akibat-el-nino-hEg6
- Detik — Penyebab musim hujan 2026 terlambat (El Niño + IOD positif): https://news.detik.com/berita/d-8673889/penyebab-musim-hujan-2026-terlambat-ada-efek-fenomena-el-nino
- CNN Indonesia — Penjelasan BMKG soal pagi panas, sore hujan (awan konvektif): https://www.cnnindonesia.com/teknologi/20260503103532-641-1354543/kenapa-belakangan-pagi-panas-sore-hujan-ini-penjelasan-bmkg
- Katadata — Suhu maksimum harian 31–35 °C saat cuaca labil: https://katadata.co.id/ekonomi-hijau/investasi-hijau/69f9cd27a7179/siang-panas-sore-hujan-lebat-apakah-indonesia-langkahi-kemarau-ini-kata-bmkg

Angka 35 °C dan 25 °C adalah gambaran umum siang terik dan sore setelah hujan deras, bukan angka satu kota tertentu.

## Cara render ulang

```console
npm i
npm run music      # bikin ulang public/music.wav (butuh python3 + numpy + ffmpeg)
npm run dev        # preview di Remotion Studio
npm run render:4k  # out/PanasKeDingin_4K_60fps.mp4
```

Semua timing ada di `src/timeline.ts`. Kalau timing diubah, samakan juga angka di `scripts/make_music.py`.

Catatan: di container cloud tempat video ini dibuat, browser bawaan Remotion tidak bisa diunduh, jadi render memakai Chromium yang sudah terpasang lewat variabel lingkungan `REMOTION_BROWSER=/path/ke/chrome`. Di komputer sendiri biasanya tidak perlu: Remotion akan mengunduh browsernya sendiri.

Lisensi Remotion: gratis untuk perorangan dan tim sampai 3 orang (https://remotion.dev/license).

## File video

- `video/PanasKeDingin_4K_60fps_upload.mp4`: 2160×3840, 60 fps, sekitar 88 MB. Ini yang di-upload ke TikTok.
- `video/PanasKeDingin_preview_1080p60.mp4`: 1080×1920, 60 fps, buat preview cepat.
- Master 4K dengan kualitas lebih tinggi (CRF 16, 124 MB) tidak masuk ke Git karena melebihi batas 100 MB GitHub. Untuk membuatnya, jalankan `npm run render:4k`.
