# Poster Audit SMKP (versi HP, 1080×1920)

Poster pengumuman Audit SMKP Minerba untuk PT Juloi Coal, PT Kalteng Coal dan PT Sumber Barito Coal, 2–3 Desember 2026.

- `output/Poster_Audit_SMKP_HP.jpg`: siap dibagikan di WhatsApp/status (1080×1920)
- `output/Poster_Audit_SMKP_HP.png`: versi PNG 1080×1920
- `output/Poster_Audit_SMKP_HP_HD.png`: versi tajam 2160×3840 (anti pecah saat dikompres)

Versi 3 (bombastis, mengikuti poster referensi internal AlamTri): langit cerah, jenjang tambang, haul truck, headline 3D merah-navy, coretan kuas kuning, dan pita tanggal merah. Karakter utama memakai seragam gaya AlamTri (navy dengan panel toska, 2 strip reflektif, logo AlamTri putih di dada) dan helm putih berlogo AlamTri geo. Ilustrasinya digambar sendiri dalam SVG. Logo AlamTri geo (`assets/`) diambil dari situs resmi alamtriminerals.id dan alamtri.com; pastikan penggunaannya sesuai pedoman brand internal.

Render ulang: `NODE_PATH=$(npm root -g) node render.js` (pakai Playwright + Chromium).
Isi teks ada di `poster.html`; karakter dan latar ada di `characters.js`.
