# Situs web Bahaya Tak Terlihat

Situs statis (HTML/CSS/JS tanpa framework) untuk edukasi K3 & IHOH, pendamping akun TikTok @bahayataktelihat.

## Struktur
- `src/articles/*.md` — artikel (frontmatter: judul, kategori, tanggal, maskot, ringkasan "Simpan ini").
- `src/build.py` — membangun semua halaman ke `site/`. Jalankan: `python3 src/build.py` (tanpa dependensi).
- `src/halus.py` — maskot Si Halus versi SVG (diadaptasi dari `bahaya-tak-terlihat/src/Characters.tsx`).
- `src/assets/` — CSS & JS.
- `site/` — hasil build yang siap diunggah (Vercel: `outputDirectory: site`).

## Wajib diganti sebelum terbit (PLACEHOLDER di `SITE` pada `src/build.py`)
- `url` — domain (usulan: bahayatakterlihat.id, belum dibeli)
- `whatsapp_channel` — saluran WhatsApp
- Angka audiens di halaman Kolaborasi, profil penulis/peninjau di halaman Tentang
- Slot iklan (`ad_slot`) dan `site/ads.txt` setelah AdSense disetujui; form buletin & kontak belum punya backend.

## Menambah artikel
Salin salah satu file di `src/articles/`, ubah frontmatter dan isinya, lalu jalankan build. Kategori: `rumah`, `kerja`, `mental`, `gaya-hidup`, `pertolongan`.
Semua artikel sebaiknya dibaca ulang dan disunting manusia (dan ditinjau tenaga kesehatan untuk topik medis) sebelum terbit.

## Video & kantor
- `src/media/video/epN.mp4` — versi web (720×1280, 30 fps, H.264 CRF 30, ±4–5,5 MB) untuk EP10–EP15. Episode lain tampil sebagai poster dengan tautan ke TikTok.
  Buat ulang: `ffmpeg -i EPn_*.mp4 -vf "scale=720:1280,fps=30" -c:v libx264 -crf 30 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart epN.mp4`.
- Untuk produksi, video sebaiknya tidak disimpan di git. Pilihan: Vercel Blob atau penyimpanan objek (R2/S3) + CDN, atau unggah ke YouTube (Shorts) dan tautkan; TikTok tetap kanal utama.
- `src/media/kantor.jpg` — cuplikan kantor virtual; tombol "Masuk ke kantor" menuju artifact Studio Bahaya Tak Terlihat (`KANTOR_URL`).
