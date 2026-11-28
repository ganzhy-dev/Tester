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
- `facebook` — URL halaman Facebook
- `whatsapp_channel` — saluran WhatsApp
- `email` — surel resmi
- Angka audiens di halaman Kolaborasi, profil penulis/peninjau di halaman Tentang
- Slot iklan (`ad_slot`) dan `site/ads.txt` setelah AdSense disetujui; form buletin & kontak belum punya backend.

## Menambah artikel
Salin salah satu file di `src/articles/`, ubah frontmatter dan isinya, lalu jalankan build. Kategori: `rumah`, `kerja`, `mental`, `gaya-hidup`, `pertolongan`.
Semua artikel sebaiknya dibaca ulang dan disunting manusia (dan ditinjau tenaga kesehatan untuk topik medis) sebelum terbit.
